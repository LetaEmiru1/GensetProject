import React from 'react';
import { GensetForm } from './components/GensetForm';
import { Fuel, ShieldCheck } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* App Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-red-600 rounded-full shadow-md">
              <Fuel className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            TotalEnergies Ethiopia
          </h1>
          <div className="flex items-center justify-center gap-2 text-red-600 font-medium bg-red-50 inline-block px-4 py-1 rounded-full mx-auto w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider">Authorized Contractor Portal</span>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto pt-2">
            Genset Preventive Maintenance Logbook
          </p>
        </div>

        {/* Main Form */}
        <GensetForm />
        
        {/* Footer */}
        <footer className="text-center space-y-2 pb-8">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} TotalEnergies Marketing Ethiopia S.C.
          </p>
          <p className="text-xs text-slate-300">
            HSE & Technical Department
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;