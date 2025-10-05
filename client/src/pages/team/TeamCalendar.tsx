import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Users,
  MapPin,
  Filter,
  Download
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'deadline' | 'milestone' | 'review' | 'personal';
  projectId?: string;
  projectName?: string;
  participants?: string[];
  location?: string;
  isAllDay: boolean;
  color: string;
}

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Sprint Planning Meeting',
        description: 'Plan the next sprint tasks and assign responsibilities',
        start: new Date(2025, 0, 15, 10, 0),
        end: new Date(2025, 0, 15, 11, 30),
        type: 'meeting',
        projectId: 'proj1',
        projectName: 'E-commerce Website',
        participants: ['Admin User', 'Team Lead', 'Developer'],
        isAllDay: false,
        color: 'blue'
      },
      {
        id: '2',
        title: 'UI/UX Review',
        description: 'Review the latest design mockups',
        start: new Date(2025, 0, 16, 14, 0),
        end: new Date(2025, 0, 16, 15, 0),
        type: 'review',
        projectId: 'proj2',
        projectName: 'Mobile App',
        participants: ['UI Designer', 'Product Manager'],
        isAllDay: false,
        color: 'green'
      },
      {
        id: '3',
        title: 'Project Deadline',
        description: 'Final deliverable for E-commerce Website',
        start: new Date(2025, 0, 20, 0, 0),
        end: new Date(2025, 0, 20, 23, 59),
        type: 'deadline',
        projectId: 'proj1',
        projectName: 'E-commerce Website',
        isAllDay: true,
        color: 'red'
      },
      {
        id: '4',
        title: 'Code Review Session',
        description: 'Review pull requests and merge code',
        start: new Date(2025, 0, 18, 16, 0),
        end: new Date(2025, 0, 18, 17, 0),
        type: 'review',
        projectId: 'proj1',
        projectName: 'E-commerce Website',
        participants: ['Senior Developer', 'Team Lead'],
        isAllDay: false,
        color: 'purple'
      }
    ];

    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      if (event.isAllDay) {
        return eventStart.toDateString() === date.toDateString();
      }
      
      return eventStart <= date && eventEnd >= date;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800',
      deadline: 'bg-red-100 text-red-800',
      milestone: 'bg-green-100 text-green-800',
      review: 'bg-purple-100 text-purple-800',
      personal: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and project deadlines</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day?.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === day?.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      isToday ? 'bg-primary/10 border-primary' : ''
                    } ${isSelected ? 'bg-primary/20' : ''}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary' : ''
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Events for {formatDate(selectedDate)}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                            )}
                            {!event.isAllDay && (
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                              </div>
                            )}
                            {event.projectName && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {event.projectName}
                              </Badge>
                            )}
                            {event.participants && event.participants.length > 0 && (
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Users className="h-3 w-3 mr-1" />
                                {event.participants.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.start) > new Date())
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.type).split(' ')[0]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start).toLocaleDateString()} at {formatTime(new Date(event.start))}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Types Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { type: 'meeting', label: 'Meetings', color: 'bg-blue-100 text-blue-800' },
                  { type: 'deadline', label: 'Deadlines', color: 'bg-red-100 text-red-800' },
                  { type: 'milestone', label: 'Milestones', color: 'bg-green-100 text-green-800' },
                  { type: 'review', label: 'Reviews', color: 'bg-purple-100 text-purple-800' },
                  { type: 'personal', label: 'Personal', color: 'bg-gray-100 text-gray-800' }
                ].map(item => (
                  <div key={item.type} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color.split(' ')[0]}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
