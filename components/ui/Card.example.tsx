import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Flame } from 'lucide-react';

/**
 * Card Component Examples
 * 
 * This file demonstrates all variants and use cases of the Card component.
 * These examples align with the Forgrin design system and requirements.
 */

export function CardExamples() {
  return (
    <div className="p-8 space-y-8 bg-deep-indigo min-h-screen">
      <h1 className="text-h2 font-bold text-white mb-8">Card Component Examples</h1>

      {/* Standard Card Examples */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Standard Cards</h2>

        <Card variant="standard">
          <h3 className="text-h4 font-bold text-white mb-2">Basic Standard Card</h3>
          <p className="text-gray-300">
            This is a standard card with dark background, 16px padding, rounded corners,
            and glassmorphism effect.
          </p>
        </Card>

        <Card variant="standard" className="max-w-md">
          <h3 className="text-h4 font-bold text-white mb-2">Profile Information</h3>
          <div className="space-y-2 text-gray-300">
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john@example.com</p>
            <p><strong>Subscription:</strong> Pro</p>
          </div>
        </Card>
      </section>

      {/* Stats Card Examples */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Stats Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="stats">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold text-white">8.5</div>
              <div className="text-sm text-gray-300">Focus Hours Today</div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <span>↑</span>
                <span>15% from yesterday</span>
              </div>
            </div>
          </Card>

          <Card variant="stats">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold text-white">12</div>
              <div className="text-sm text-gray-300">Tasks Completed</div>
              <div className="flex items-center gap-1 text-xs text-neon-cyan">
                <span>↑</span>
                <span>3 more than usual</span>
              </div>
            </div>
          </Card>

          <Card variant="stats">
            <div className="flex flex-col gap-2">
              <div className="text-5xl font-bold text-white">7</div>
              <div className="text-sm text-gray-300">Day Streak</div>
              <div className="flex items-center gap-1 text-xs text-soft-purple">
                <Flame className="w-4 h-4" />
                <span>Keep it up!</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Task Card Examples */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Task Cards</h2>

        <div className="space-y-3 max-w-2xl">
          <Card variant="task">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-electric-blue focus:ring-electric-blue"
              />
              <div className="flex-1">
                <h4 className="font-medium text-white">Implement authentication system</h4>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-electric-blue/20 text-neon-cyan text-xs rounded">
                    Backend
                  </span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                    High Priority
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">2h</div>
              <div className="cursor-move text-gray-500 hover:text-gray-300">⋮⋮</div>
            </div>
          </Card>

          <Card variant="task">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-electric-blue focus:ring-electric-blue"
              />
              <div className="flex-1">
                <h4 className="font-medium text-white">Write unit tests</h4>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-soft-purple/20 text-soft-purple text-xs rounded">
                    Testing
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    Medium Priority
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">1h</div>
              <div className="cursor-move text-gray-500 hover:text-gray-300">⋮⋮</div>
            </div>
          </Card>

          <Card variant="task">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked
                className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-electric-blue focus:ring-electric-blue"
              />
              <div className="flex-1 opacity-60">
                <h4 className="font-medium text-white line-through">Update documentation</h4>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                    Docs
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">30m</div>
              <div className="cursor-move text-gray-500 hover:text-gray-300">⋮⋮</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Session Card Examples */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Session Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <Card variant="session">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl font-mono text-white">25:00</div>
              <div className="text-sm text-gray-400">Deep Work Session</div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">Pause</Button>
                <Button variant="danger" size="sm">Stop</Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Distractions:</span>
                <span className="font-bold text-neon-cyan">0</span>
              </div>
            </div>
          </Card>

          <Card variant="session">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl font-mono text-yellow-400">12:34</div>
              <div className="text-sm text-yellow-400">Paused</div>
              <div className="flex gap-3">
                <Button variant="primary" size="sm">Resume</Button>
                <Button variant="danger" size="sm">Stop</Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Distractions:</span>
                <span className="font-bold text-orange-400">2</span>
              </div>
            </div>
          </Card>
        </div>

        <Card variant="session" className="max-w-md">
          <div className="space-y-3">
            <h3 className="text-h4 font-bold text-white">Session History</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Duration:</span>
                <span className="font-mono">45:00</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Distractions:</span>
                <span className="text-neon-cyan">3</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Completed:</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-sm text-gray-400 italic">
                &quot;Great focus session! Completed the authentication module.&quot;
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Interactive Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            variant="standard"
            onClick={() => alert('Card clicked!')}
            className="cursor-pointer"
          >
            <h3 className="text-h4 font-bold text-white mb-2">Clickable Card</h3>
            <p className="text-gray-300">
              This card has an onClick handler. Try clicking it!
            </p>
          </Card>

          <Card variant="standard">
            <h3 className="text-h4 font-bold text-white mb-2">Card with Actions</h3>
            <p className="text-gray-300 mb-4">
              Cards can contain interactive elements like buttons.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Primary Action</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Custom Styled Cards */}
      <section className="space-y-4">
        <h2 className="text-h3 font-bold text-white">Custom Styled Cards</h2>

        <Card variant="standard" className="max-w-sm border-2 border-electric-blue">
          <h3 className="text-h4 font-bold text-electric-blue mb-2">Featured Card</h3>
          <p className="text-gray-300">
            This card has a custom border color to highlight it.
          </p>
        </Card>

        <Card variant="stats" className="max-w-md bg-gradient-to-br from-neon-cyan/20 to-electric-blue/20">
          <div className="flex flex-col gap-2">
            <div className="text-5xl font-bold text-neon-cyan">100%</div>
            <div className="text-sm text-gray-300">Custom Gradient</div>
            <div className="text-xs text-gray-400">
              You can override the default gradient with custom classes
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default CardExamples;
