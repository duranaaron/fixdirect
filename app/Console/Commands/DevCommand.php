<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class DevCommand extends Command
{
    protected $signature = 'dev {--install : Run composer install and npm install first}';

    protected $description = 'Start alle development services (queue, reverb, vite)';

    /**
     * @var array<int, Process>
     */
    protected array $processes = [];

    protected bool $shuttingDown = false;

    public function handle(): int
    {
        if ($this->option('install')) {
            $this->info('Dependencies installeren...');

            $this->runSync(['composer', 'install', '--no-interaction']);
            $this->runSync(['npm', 'install']);
            $this->runSync(['php', 'artisan', 'migrate', '--no-interaction']);
        }

        $services = [
            'queue' => ['php', 'artisan', 'queue:work', '--tries=1'],
            'reverb' => ['php', 'artisan', 'reverb:start'],
            'vite' => ['npm', 'run', 'dev'],
        ];

        $colors = [
            'queue' => "\e[34m",
            'reverb' => "\e[32m",
            'vite' => "\e[33m",
        ];

        $reset = "\e[0m";

        $this->newLine();
        $this->info('FixDirect development services starten...');
        $this->newLine();

        foreach ($services as $name => $command) {
            $process = new Process($command);
            $process->setWorkingDirectory(base_path());
            $process->setTimeout(null);

            $process->start(function ($type, $buffer) use ($name, $colors, $reset) {
                $color = $colors[$name];
                $tag = str_pad($name, 6);

                foreach (explode("\n", trim($buffer)) as $line) {
                    if ($line !== '') {
                        $this->output->write("{$color}[{$tag}]{$reset} {$line}\n");
                    }
                }
            });

            $this->processes[] = $process;
            $this->line("  <fg=green>✓</> <fg=white;options=bold>{$name}</> gestart");
        }

        $this->newLine();
        $this->info('Alle services draaien. Druk Ctrl+C om te stoppen.');
        $this->newLine();

        // Shutdown handler (cross-platform)
        $shutdown = function () {
            if ($this->shuttingDown) {
                return;
            }

            $this->shuttingDown = true;

            $this->newLine();
            $this->info('Services stoppen...');

            foreach ($this->processes as $process) {
                if ($process->isRunning()) {
                    $process->stop(3); // zachte stop (SIGTERM equivalent)
                }
            }

            $this->newLine();
            $this->info('Alles gestopt 👋');
        };

        // Windows Ctrl+C support
        if (function_exists('sapi_windows_set_ctrl_handler')) {
            sapi_windows_set_ctrl_handler(function () use ($shutdown) {
                $shutdown();
                exit;
            });
        }

        register_shutdown_function($shutdown);

        // Main loop
        try {
            while (true) {
                $allStopped = true;

                foreach ($this->processes as $process) {
                    if ($process->isRunning()) {
                        $allStopped = false;
                        break;
                    }
                }

                if ($allStopped) {
                    break;
                }

                usleep(200_000); // 200ms
            }
        } finally {
            $shutdown();
        }

        return self::SUCCESS;
    }

    /**
     * @param  array<int, string>  $command
     */
    protected function runSync(array $command): void
    {
        $process = new Process($command);
        $process->setWorkingDirectory(base_path());
        $process->setTimeout(300);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });
    }
}
