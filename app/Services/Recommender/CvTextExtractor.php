<?php

namespace App\Services\Recommender;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use PhpOffice\PhpWord\Element\AbstractContainer;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Smalot\PdfParser\Parser as PdfParser;
use Throwable;

/**
 * Extracts plain text from an applicant's uploaded CV.
 *
 * Supported formats: PDF (smalot/pdfparser) and DOCX (phpoffice/phpword).
 * Anything else (e.g. legacy .doc) is flagged manual_review so the
 * orchestrator can short-circuit before calling Gemini.
 */
class CvTextExtractor
{
    public const STATUS_EXTRACTED = 'extracted';
    public const STATUS_MANUAL_REVIEW = 'manual_review';

    /**
     * @return array{status: string, text: string, reason?: string}
     */
    public function extract(?string $resumePath): array
    {
        if (! $resumePath) {
            return [
                'status' => self::STATUS_MANUAL_REVIEW,
                'text' => '',
                'reason' => 'No resume file attached to the application.',
            ];
        }

        if (! Storage::disk('public')->exists($resumePath)) {
            return [
                'status' => self::STATUS_MANUAL_REVIEW,
                'text' => '',
                'reason' => 'Resume file is missing on the server.',
            ];
        }

        $extension = strtolower(pathinfo($resumePath, PATHINFO_EXTENSION));
        $absolutePath = Storage::disk('public')->path($resumePath);

        try {
            $text = match ($extension) {
                'pdf' => $this->extractPdf($absolutePath),
                'docx' => $this->extractDocx($absolutePath),
                default => null,
            };
        } catch (Throwable $e) {
            Log::warning('CV extraction failed', [
                'path' => $resumePath,
                'extension' => $extension,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => self::STATUS_MANUAL_REVIEW,
                'text' => '',
                'reason' => 'Resume could not be parsed automatically: ' . $e->getMessage(),
            ];
        }

        if ($text === null) {
            return [
                'status' => self::STATUS_MANUAL_REVIEW,
                'text' => '',
                'reason' => "Unsupported CV format (.{$extension}). Please review manually.",
            ];
        }

        $normalized = $this->normalize($text);

        if (strlen($normalized) < 50) {
            return [
                'status' => self::STATUS_MANUAL_REVIEW,
                'text' => $normalized,
                'reason' => 'Extracted CV text was too short to evaluate. Please review manually.',
            ];
        }

        $limit = (int) config('services.gemini.cv_text_limit', 30000);
        if ($limit > 0 && strlen($normalized) > $limit) {
            $normalized = substr($normalized, 0, $limit);
        }

        return [
            'status' => self::STATUS_EXTRACTED,
            'text' => $normalized,
        ];
    }

    private function extractPdf(string $absolutePath): string
    {
        $parser = new PdfParser();
        $document = $parser->parseFile($absolutePath);
        return $document->getText();
    }

    private function extractDocx(string $absolutePath): string
    {
        $phpWord = WordIOFactory::load($absolutePath);
        $buffer = [];

        foreach ($phpWord->getSections() as $section) {
            $this->collectText($section, $buffer);
        }

        return implode("\n", $buffer);
    }

    private function collectText(AbstractContainer $container, array &$buffer): void
    {
        foreach ($container->getElements() as $element) {
            if ($element instanceof Text) {
                $buffer[] = $element->getText();
                continue;
            }

            if ($element instanceof TextRun) {
                foreach ($element->getElements() as $child) {
                    if ($child instanceof Text) {
                        $buffer[] = $child->getText();
                    }
                }
                continue;
            }

            if ($element instanceof AbstractContainer) {
                $this->collectText($element, $buffer);
            }
        }
    }

    private function normalize(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace("/\n{3,}/", "\n\n", $text);
        return trim($text);
    }
}
