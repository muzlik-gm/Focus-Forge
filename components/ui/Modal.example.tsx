'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * Modal Component Examples
 * 
 * This file demonstrates various use cases for the Modal component
 * as specified in Requirement 20.
 */

export function ModalExamples() {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [largeModalOpen, setLargeModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-white mb-8">Modal Examples</h1>

      {/* Basic Modal */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Basic Modal</h2>
        <Button onClick={() => setBasicModalOpen(true)}>
          Open Basic Modal
        </Button>
        <Modal
          isOpen={basicModalOpen}
          onClose={() => setBasicModalOpen(false)}
          title="Welcome to FocusForge"
        >
          <p className="mb-4">
            This is a basic modal with some content. You can close it by:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Clicking the X button</li>
            <li>Pressing the Escape key</li>
            <li>Clicking outside the modal</li>
          </ul>
          <Button onClick={() => setBasicModalOpen(false)}>
            Got it!
          </Button>
        </Modal>
      </div>

      {/* Confirmation Modal */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Delete Confirmation Modal</h2>
        <Button variant="danger" onClick={() => setConfirmModalOpen(true)}>
          Delete Task
        </Button>
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Confirm Deletion"
        >
          <p className="mb-6">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Handle deletion
                console.log('Task deleted');
                setConfirmModalOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>

      {/* Form Modal */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Create Task Modal</h2>
        <Button onClick={() => setFormModalOpen(true)}>
          Create New Task
        </Button>
        <Modal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title="Create New Task"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Task created');
              setFormModalOpen(false);
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium mb-1">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Large Content Modal */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Start Focus Session Modal</h2>
        <Button onClick={() => setLargeModalOpen(true)}>
          Start Focus Session
        </Button>
        <Modal
          isOpen={largeModalOpen}
          onClose={() => setLargeModalOpen(false)}
          title="Start Focus Session"
          className="max-w-lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="session-duration" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                id="session-duration"
                type="number"
                min="1"
                max="180"
                defaultValue="25"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" size="sm">
                  25 min
                </Button>
                <Button variant="secondary" size="sm">
                  45 min
                </Button>
                <Button variant="secondary" size="sm">
                  90 min
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="session-task" className="block text-sm font-medium mb-1">
                Link to Task (optional)
              </label>
              <select
                id="session-task"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="">No task selected</option>
                <option value="1">Implement authentication</option>
                <option value="2">Design dashboard</option>
                <option value="3">Write documentation</option>
              </select>
            </div>
            <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-3">
              <p className="text-sm">
                💡 <strong>Tip:</strong> Focus sessions work best in 25-45 minute intervals.
                Take a 5-minute break between sessions.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setLargeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  console.log('Focus session started');
                  setLargeModalOpen(false);
                }}
              >
                Start Session
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Invite Team Member Modal Example */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Invite Team Member Modal</h2>
        <p className="text-gray-400 text-sm mb-2">
          Example of a modal for team collaboration features
        </p>
        <Button onClick={() => alert('This would open an invite modal')}>
          Invite Team Member
        </Button>
      </div>

      {/* Billing Upgrade Modal Example */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Billing Upgrade Modal</h2>
        <p className="text-gray-400 text-sm mb-2">
          Example of a modal for subscription upgrades
        </p>
        <Button onClick={() => alert('This would open an upgrade modal')}>
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}

export default ModalExamples;
