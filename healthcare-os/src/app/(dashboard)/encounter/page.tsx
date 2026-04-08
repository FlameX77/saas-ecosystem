"use client";

import { useState } from "react";
import PatientSelector from "@/components/scribe/PatientSelector";
import ConsentGuard from "@/components/scribe/ConsentGuard";
import AudioRecorder from "@/components/scribe/AudioRecorder";
import SOAPNote from "@/components/scribe/SOAPNote";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function EncounterPageWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <EncounterPage />
    </QueryClientProvider>
  );
}

function EncounterPage() {
  const [patient, setPatient] = useState<any>(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [noteData, setNoteData] = useState<any>(null);

  if (!patient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Start New Encounter</h1>
        <PatientSelector onSelect={setPatient} clinicId="default_clinic_id" />
      </div>
    );
  }

  if (!consentGranted) {
    return (
      <div className="p-6">
        <ConsentGuard isOpen={true} onConfirm={() => setConsentGranted(true)} onCancel={() => setPatient(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 p-6">
      <div className="w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-700">Patient: {patient.name || patient.full_name}</h2>
          <p className="text-sm text-slate-500">DOB: {patient.dob || patient.age}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-medium text-slate-700 mb-4">Encounter Recording</h3>
          <AudioRecorder onComplete={(blob, lang) => console.log('Complete recording:', blob, lang)} />
        </div>
      </div>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
        <SOAPNote 
          note={noteData || { subjective: '', objective: '', assessment: '', plan: '' }} 
          onUpdate={setNoteData} 
        />
      </div>
    </div>
  );
}
