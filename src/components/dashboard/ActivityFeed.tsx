export const ActivityFeed = () => {
  const activities = [
    { time: '2 min ago', action: 'Light turned on in Living Room', icon: 'lightbulb' },
    { time: '5 min ago', action: 'Door unlocked via app', icon: 'door-open' },
    { time: '10 min ago', action: 'Thermostat set to 72°F', icon: 'thermometer' },
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-center space-x-3 p-3 rounded-md bg-muted/50">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};