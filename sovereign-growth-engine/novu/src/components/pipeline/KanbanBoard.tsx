"use client";
import { useState } from "react";
import { Contact } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
const stages = [
  { key: "new_lead", title: "New Lead", color: "#0066ff" },
  { key: "contacted", title: "Contacted", color: "#ffb020" },
  { key: "replied", title: "Replied", color: "#00b8d9" },
  { key: "appointment_booked", title: "Booked", color: "#00c896" },
  { key: "recovered", title: "Recovered", color: "#00c896" },
  { key: "lost", title: "Lost", color: "#ff4444" },
];
export function KanbanBoard({ contacts, onStageChange }: { contacts: Contact[]; onStageChange: (contactId: string, newStage: string) => void }) {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const handleDragStart = (e: React.DragEvent, contact: Contact) => { setDraggedContact(contact); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e: React.DragEvent, stage: string) => { e.preventDefault(); if (draggedContact && draggedContact.stage !== stage) { onStageChange(draggedContact.id, stage); } setDraggedContact(null); };
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((s) => (
        <KanbanColumn key={s.key} title={s.title} color={s.color} stage={s.key} contacts={contacts.filter((c) => c.stage === s.key)} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
      ))}
    </div>
  );
}
