/**
 * Google Calendar Service
 * Handles all interactions with the Google Calendar REST API.
 * Uses the OAuth2 access token obtained during Google Sign-In.
 */

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_ID = 'primary'; // Use the user's primary calendar

/**
 * Convert a task object to a Google Calendar event format.
 * Tasks with dates become all-day events.
 */
function taskToCalendarEvent(task) {
    // Build description with task metadata
    const descParts = [];
    if (task.subject) descParts.push(`📚 Subject: ${task.subject}`);
    if (task.priority) descParts.push(`🔥 Priority: ${task.priority.toUpperCase()}`);
    if (task.tags && task.tags.length > 0) descParts.push(`🏷️ Tags: ${task.tags.map(t => `#${t}`).join(' ')}`);
    if (task.status) descParts.push(`📋 Status: ${task.status}`);
    if (task.description) {
        descParts.push('');
        descParts.push(task.description);
    }
    descParts.push('');
    descParts.push('— Synced from Kanban Board');

    const description = descParts.join('\n');

    // Determine event date
    let dateStr = task.date;

    // If no date or invalid, use today
    if (!dateStr || dateStr === 'No Date' || dateStr === 'Today') {
        const today = new Date();
        dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Handle ISO strings with time component
    if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }

    // Validate the date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
        // Fallback to today if format is unexpected
        const today = new Date();
        dateStr = today.toISOString().split('T')[0];
    }

    // Calculate next day for all-day event end
    const startDate = new Date(dateStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    // Color based on priority
    let colorId;
    switch (task.priority) {
        case 'urgent': colorId = '11'; break; // Red (Tomato)
        case 'high': colorId = '6'; break;    // Orange (Tangerine)
        case 'medium': colorId = '9'; break;  // Blue (Blueberry)
        case 'low': colorId = '2'; break;     // Green (Sage)
        default: colorId = '9'; break;
    }

    // Title prefix based on priority
    // "!" prefix forces alphabetical sort to TOP in Google Calendar
    // More "!" = higher position above other events
    let titlePrefix;
    switch (task.priority) {
        case 'urgent': titlePrefix = '!!! 🚨 URGENT: '; break;
        case 'high': titlePrefix = '!! ⚠️ HIGH: '; break;
        case 'medium': titlePrefix = '! 📌 '; break;
        case 'low': titlePrefix = '📝 '; break;
        default: titlePrefix = '! 📌 '; break;
    }

    // Reminders based on priority — more urgent = more reminders
    let reminderOverrides;
    switch (task.priority) {
        case 'urgent':
            reminderOverrides = [
                { method: 'popup', minutes: 0 },      // At the time
                { method: 'popup', minutes: 30 },     // 30 min before
                { method: 'popup', minutes: 60 },     // 1 hour before
                { method: 'popup', minutes: 1440 },   // 1 day before
            ];
            break;
        case 'high':
            reminderOverrides = [
                { method: 'popup', minutes: 0 },      // At the time
                { method: 'popup', minutes: 60 },     // 1 hour before
                { method: 'popup', minutes: 1440 },   // 1 day before
            ];
            break;
        case 'medium':
            reminderOverrides = [
                { method: 'popup', minutes: 60 },     // 1 hour before
                { method: 'popup', minutes: 1440 },   // 1 day before
            ];
            break;
        default:
            reminderOverrides = [
                { method: 'popup', minutes: 60 },     // 1 hour before
            ];
            break;
    }

    return {
        summary: `${titlePrefix}${task.title}`,
        description,
        start: {
            date: dateStr,
        },
        end: {
            date: endDateStr,
        },
        colorId,
        reminders: {
            useDefault: false,
            overrides: reminderOverrides,
        },
    };
}

/**
 * Create a new event in Google Calendar.
 * @returns {string|null} The created event's ID, or null on failure
 */
export async function createCalendarEvent(accessToken, task) {
    if (!accessToken) {
        console.warn('[GCal] No access token — skipping sync');
        return null;
    }

    try {
        const event = taskToCalendarEvent(task);
        const response = await fetch(
            `${CALENDAR_API_BASE}/calendars/${CALENDAR_ID}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[GCal] Failed to create event:', errorData);
            return null;
        }

        const data = await response.json();
        console.log('[GCal] Event created:', data.id);
        return data.id;
    } catch (error) {
        console.error('[GCal] Error creating event:', error);
        return null;
    }
}

/**
 * Update an existing event in Google Calendar.
 * @returns {boolean} Whether the update was successful
 */
export async function updateCalendarEvent(accessToken, eventId, task) {
    if (!accessToken || !eventId) {
        console.warn('[GCal] Missing token or eventId — skipping update');
        return false;
    }

    try {
        const event = taskToCalendarEvent(task);
        const response = await fetch(
            `${CALENDAR_API_BASE}/calendars/${CALENDAR_ID}/events/${eventId}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[GCal] Failed to update event:', errorData);
            return false;
        }

        console.log('[GCal] Event updated:', eventId);
        return true;
    } catch (error) {
        console.error('[GCal] Error updating event:', error);
        return false;
    }
}

/**
 * Delete an event from Google Calendar.
 * @returns {boolean} Whether the deletion was successful
 */
export async function deleteCalendarEvent(accessToken, eventId) {
    if (!accessToken || !eventId) {
        console.warn('[GCal] Missing token or eventId — skipping delete');
        return false;
    }

    try {
        const response = await fetch(
            `${CALENDAR_API_BASE}/calendars/${CALENDAR_ID}/events/${eventId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok && response.status !== 410) {
            // 410 = already deleted, which is fine
            const errorData = await response.json().catch(() => ({}));
            console.error('[GCal] Failed to delete event:', errorData);
            return false;
        }

        console.log('[GCal] Event deleted:', eventId);
        return true;
    } catch (error) {
        console.error('[GCal] Error deleting event:', error);
        return false;
    }
}

/**
 * Sync all tasks to Google Calendar (full push).
 * Used for initial sync or "Sync All" button.
 * @returns {Object} Map of taskId -> googleEventId for successfully synced tasks
 */
export async function syncAllTasks(accessToken, tasks) {
    if (!accessToken) {
        console.warn('[GCal] No access token — skipping full sync');
        return {};
    }

    const results = {};
    let successCount = 0;
    let failCount = 0;

    for (const task of tasks) {
        try {
            if (task.googleEventId) {
                // Task already has an event — update it
                const success = await updateCalendarEvent(accessToken, task.googleEventId, task);
                if (success) {
                    results[task.id] = task.googleEventId;
                    successCount++;
                } else {
                    failCount++;
                }
            } else {
                // Task has no event — create one
                const eventId = await createCalendarEvent(accessToken, task);
                if (eventId) {
                    results[task.id] = eventId;
                    successCount++;
                } else {
                    failCount++;
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`[GCal] Error syncing task ${task.id}:`, error);
            failCount++;
        }
    }

    console.log(`[GCal] Full sync complete: ${successCount} success, ${failCount} failed`);
    return results;
}
