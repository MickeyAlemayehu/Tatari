<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Login</title>
</head>
<body>
    <h1>Employee Login</h1>

    @if ($errors->any())
        <div>
            {{ $errors->first() }}
        </div>
    @endif

    <form method="POST" action="{{ route('login.perform') }}">
        @csrf
        <div>
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus>
        </div>

        <div>
            <label for="password">Password</label>
            <input id="password" type="password" name="password" required>
        </div>

        <div>
            <label for="remember">
                <input id="remember" type="checkbox" name="remember">
                Remember me
            </label>
        </div>

        <button type="submit">Sign in</button>
    </form>
</body>
</html>
