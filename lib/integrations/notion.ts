/**
 * Notion Integration Service
 * 
 * Syncs tasks, sessions, and productivity data with Notion:
 * - Create pages for tasks
 * - Update databases with session data
 * - Generate weekly reports
 * - Sync focus sessions to calendar
 * - Track productivity metrics
 */

import { Client } from '@notionhq/client';

export interface NotionConfig {
  auth: string;
  databaseId: string;
}

export interface NotionTask {
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
  tags?: string[];
}

export interface NotionSession {
  date: Date;
  duration: number;
  productivity: number;
  distractions: number;
  focusApps: string[];
}

export class NotionIntegration {
  private notion: Client;
  private databaseId: string;

  constructor(config: NotionConfig) {
    this.notion = new Client({ auth: config.auth });
    this.databaseId = config.databaseId;
  }

  /**
   * Create task page in Notion database
   */
  async createTask(task: NotionTask): Promise<string> {
    const response = await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: task.title,
              },
            },
          ],
        },
        Status: {
          select: {
            name: task.status,
          },
        },
        Priority: task.priority
          ? {
              select: {
                name: task.priority,
              },
            }
          : undefined,
        'Due Date': task.dueDate
          ? {
              date: {
                start: task.dueDate.toISOString(),
              },
            }
          : undefined,
        Tags: task.tags
          ? {
              multi_select: task.tags.map((tag) => ({ name: tag })),
            }
          : undefined,
      },
      children: task.description
        ? [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: task.description,
                    },
                  },
                ],
              },
            },
          ]
        : undefined,
    });

    return response.id;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    pageId: string,
    status: 'Not Started' | 'In Progress' | 'Done'
  ): Promise<void> {
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: {
            name: status,
          },
        },
      },
    });
  }

  /**
   * Create focus session entry
   */
  async logFocusSession(session: NotionSession): Promise<string> {
    const response = await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `Focus Session - ${session.date.toLocaleDateString()}`,
              },
            },
          ],
        },
        Date: {
          date: {
            start: session.date.toISOString(),
          },
        },
        Duration: {
          number: session.duration,
        },
        Productivity: {
          number: session.productivity,
        },
        Distractions: {
          number: session.distractions,
        },
        'Focus Apps': {
          multi_select: session.focusApps.map((app) => ({ name: app })),
        },
      },
    });

    return response.id;
  }

  /**
   * Create weekly productivity report
   */
  async createWeeklyReport(data: {
    weekStart: Date;
    weekEnd: Date;
    totalFocusHours: number;
    totalTasks: number;
    avgProductivity: number;
    topApps: { name: string; hours: number }[];
    achievements: string[];
  }): Promise<string> {
    const response = await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `Weekly Report - ${data.weekStart.toLocaleDateString()}`,
              },
            },
          ],
        },
        'Week Start': {
          date: {
            start: data.weekStart.toISOString(),
            end: data.weekEnd.toISOString(),
          },
        },
        'Total Focus Hours': {
          number: data.totalFocusHours,
        },
        'Tasks Completed': {
          number: data.totalTasks,
        },
        'Avg Productivity': {
          number: data.avgProductivity,
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '📊 Summary' } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `Total Focus Time: ${data.totalFocusHours} hours\nTasks Completed: ${data.totalTasks}\nAverage Productivity: ${data.avgProductivity}%`,
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '🎯 Top Applications' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: data.topApps.map((app) => ({
              type: 'text',
              text: { content: `${app.name}: ${app.hours}h\n` },
            })),
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '🏆 Achievements' } }],
          },
        },
        ...data.achievements.map((achievement) => ({
          object: 'block' as const,
          type: 'bulleted_list_item' as const,
          bulleted_list_item: {
            rich_text: [{ type: 'text' as const, text: { content: achievement } }],
          },
        })),
      ],
    });

    return response.id;
  }

  /**
   * Query tasks from database
   */
  async getTasks(filter?: {
    status?: string;
    priority?: string;
  }): Promise<any[]> {
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: filter
        ? {
            and: [
              filter.status
                ? {
                    property: 'Status',
                    select: {
                      equals: filter.status,
                    },
                  }
                : undefined,
              filter.priority
                ? {
                    property: 'Priority',
                    select: {
                      equals: filter.priority,
                    },
                  }
                : undefined,
            ].filter(Boolean) as any,
          }
        : undefined,
    });

    return response.results;
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalPages: number;
    completedTasks: number;
    inProgressTasks: number;
  }> {
    const [all, completed, inProgress] = await Promise.all([
      this.notion.databases.query({ database_id: this.databaseId }),
      this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'Status',
          select: {
            equals: 'Done',
          },
        },
      }),
      this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'Status',
          select: {
            equals: 'In Progress',
          },
        },
      }),
    ]);

    return {
      totalPages: all.results.length,
      completedTasks: completed.results.length,
      inProgressTasks: inProgress.results.length,
    };
  }

  /**
   * Sync task completion
   */
  async syncTaskCompletion(
    pageId: string,
    completedAt: Date,
    focusTime: number
  ): Promise<void> {
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: {
            name: 'Done',
          },
        },
        'Completed At': {
          date: {
            start: completedAt.toISOString(),
          },
        },
        'Focus Time': {
          number: focusTime,
        },
      },
    });
  }
}

/**
 * Helper function to initialize Notion integration
 */
export function createNotionIntegration(
  auth: string,
  databaseId: string
): NotionIntegration {
  return new NotionIntegration({ auth, databaseId });
}
