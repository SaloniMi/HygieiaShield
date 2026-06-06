'use client';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import PatientInfoPage from '@/flows/PatientInfoPage';
import SymptomIntakePage from '@/flows/SymptomIntakePage';
import DecisionPage from '@/flows/DecisionPage';
import PulseHeader from '@/components/calm-ui/common/PulseTriageHeader';


export default function Home() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;


  const [formData, setFormData] = useState({
    patientName: '',
    ageGroup: '',
    symptoms: {},
    location: {},
    decision: {}
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));


  return (
    <div className="h-screen flex flex-col justify-between w-full bg-[#f6f5f0] text-[#1a1c1e] antialiased selection:bg-blue-100">

      {/* Centered Top Branding Header */}
      <PulseHeader title="PulseTriage" />


      <main className="flex-1 overflow-y-auto w-full px-6 pb-4">
        {/* Step counter placed inside main so it scrolls naturally with the form */}
        <div className="w-full text-left pt-2 pb-4">
          <span className="text-[15px] font-bold text-[#1e4e8c]">
            Step {step} of {totalSteps}
          </span>
        </div>


        {step === 1 && (
          <PatientInfoPage
            data={formData}
            setData={setFormData}
            onNext={nextStep}
          />
        )}


        {step === 2 && (
          <SymptomIntakePage
            data={formData}
            setData={setFormData}
            onNext={nextStep}
          />
        )}

        {step === 3 && (
          <DecisionPage
            data={formData}
            onNext={nextStep}
          />
        )}
      </main>


      {/* Bottom Pagination Dots */}
      <footer className="w-full pb-6 pt-2 flex justify-center items-center gap-2 bg-gradient-to-t from-[#f6f5f0] via-[#f6f5f0] to-transparent">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCurrent = step === index + 1;
          return (
            <div
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${isCurrent
                ? 'w-7 bg-[#1e4e8c]'
                : 'w-2.5 bg-gray-300 opacity-60'
                }`}
            />
          );
        })}
      </footer>
    </div>
  );
}
