import tkinter as tk
from tkinter import messagebox
from datetime import datetime


class EventManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Event Manager")
        self.events = []  

        
        self.create_ui()

    def create_ui(self):
        tk.Label(self.root, text="Start Time (HH:MM):").grid(row=0, column=0, padx=5, pady=5)
        self.start_time_entry = tk.Entry(self.root)
        self.start_time_entry.grid(row=0, column=1, padx=5, pady=5)

        tk.Label(self.root, text="End Time (HH:MM):").grid(row=1, column=0, padx=5, pady=5)
        self.end_time_entry = tk.Entry(self.root)
        self.end_time_entry.grid(row=1, column=1, padx=5, pady=5)

        tk.Label(self.root, text="Description:").grid(row=2, column=0, padx=5, pady=5)
        self.description_entry = tk.Entry(self.root)
        self.description_entry.grid(row=2, column=1, padx=5, pady=5)

        tk.Button(self.root, text="Add Event", command=self.add_event).grid(row=3, column=0, columnspan=2, pady=10)
        tk.Button(self.root, text="View Events", command=self.view_events).grid(row=4, column=0, columnspan=2, pady=5)

    def add_event(self):
        start_time = self.start_time_entry.get()
        end_time = self.end_time_entry.get()
        description = self.description_entry.get()

        if not self.validate_time_format(start_time) or not self.validate_time_format(end_time):
            messagebox.showerror("Invalid Time", "Please enter time in HH:MM format.")
            return

        start_dt = datetime.strptime(start_time, "%H:%M")
        end_dt = datetime.strptime(end_time, "%H:%M")

        if start_dt >= end_dt:
            messagebox.showerror("Invalid Time", "Start time must be earlier than end time.")
            return

        for event in self.events:
            event_start = datetime.strptime(event["start_time"], "%H:%M")
            event_end = datetime.strptime(event["end_time"], "%H:%M")
            if (start_dt < event_end and end_dt > event_start):
                messagebox.showerror("Conflict Detected", f"Conflict with event: {event['description']}")
                return

        
        self.events.append({"start_time": start_time, "end_time": end_time, "description": description})
        messagebox.showinfo("Success", "Event added successfully!")

    def view_events(self):
        if not self.events:
            messagebox.showinfo("No Events", "No events scheduled.")
            return

        events_str = "\n".join(
            [f"{event['start_time']} - {event['end_time']}: {event['description']}" for event in self.events]
        )
        messagebox.showinfo("Scheduled Events", events_str)

    @staticmethod
    def validate_time_format(time_str):
        try:
            datetime.strptime(time_str, "%H:%M")
            return True
        except ValueError:
            return False


if __name__ == "__main__":
    root = tk.Tk()
    app = EventManager(root)
    root.mainloop()
#refered geekesforgeeks,w3schools and youtube
