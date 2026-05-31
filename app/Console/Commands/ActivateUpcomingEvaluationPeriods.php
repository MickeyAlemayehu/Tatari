<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EvaluationPeriod;
use App\Services\SelfEvaluationAutoAssigner;
use App\Events\EvaluationPeriodActivated;

class ActivateUpcomingEvaluationPeriods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'evaluation:activate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activates upcoming evaluation periods whose start date has arrived';

    /**
     * Execute the console command.
     */
    public function handle(SelfEvaluationAutoAssigner $autoAssigner)
    {
        $periods = EvaluationPeriod::where('status', 'upcoming')
            ->whereDate('start_date', '<=', today())
            ->orderBy('start_date')
            ->orderBy('id')
            ->get();

        if ($periods->isEmpty()) {
            $this->info('No upcoming periods to activate.');
            return;
        }

        foreach ($periods as $period) {
            $existing = EvaluationPeriod::where('company_id', $period->company_id)
                ->where('status', 'active')
                ->where('id', '!=', $period->id)
                ->first();

            if ($existing) {
                $this->warn("Skipping period \"{$period->name}\" (ID: {$period->id}) — company {$period->company_id} already has an active period: \"{$existing->name}\" (ID: {$existing->id}). Complete it before this one will activate.");
                continue;
            }

            $this->info("Activating period: {$period->name} (ID: {$period->id})");

            $period->update(['status' => 'active']);

            $warnings = $autoAssigner->assignFor($period);

            foreach ($warnings as $warning) {
                $this->warn("Warning: {$warning}");
            }

            event(new EvaluationPeriodActivated($period->fresh()));

            $this->info("Successfully activated period ID: {$period->id}.");
        }
    }
}
