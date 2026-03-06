export const ACHIEVEMENTS = [
    {
        id: 'first-session',
        name: 'First Sync',
        description: 'Complete your first focus session',
        icon: 'Zap',
        points: 10,
        category: 'Focus',
        criteria: { type: 'sessions', value: 1 }
    },
    {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day focus streak',
        icon: 'Flame',
        points: 50,
        category: 'Streaks',
        criteria: { type: 'streak', value: 7 }
    },
    {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 50 tasks',
        icon: 'CheckCircle2',
        points: 100,
        category: 'Tasks',
        criteria: { type: 'tasks', value: 50 }
    },
    {
        id: 'deep-work-100',
        name: 'Deep Diver',
        description: 'Log 100 hours of focus time',
        icon: 'Target',
        points: 500,
        category: 'Focus',
        criteria: { type: 'focusHours', value: 100 }
    },
    {
        id: 'project-architect',
        name: 'Project Architect',
        description: 'Create your first 5 projects',
        icon: 'Layout',
        points: 100,
        category: 'Projects',
        criteria: { type: 'projects', value: 5 }
    }
];
