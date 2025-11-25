import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { CONTRACTORS, LOCATIONS, CHECKLIST_ITEMS } from '../constants';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  Phone, 
  CheckSquare, 
  Save, 
  Loader2, 
  CheckCircle2,
  Camera,
  AlertTriangle,
} from 'lucide-react';

export const GensetForm: React.FC = () => {
  // State
  const [contractor, setContractor] = useState(CONTRACTORS[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [gensetName, setGensetName] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [currentHour, setCurrentHour] = useState<string>('');
  const [nextServiceHour, setNextServiceHour] = useState<number | ''>('');
  
  const [serviceDate, setServiceDate] = useState<string>('');
  const [nextServiceDate, setNextServiceDate] = useState<string>('');
  
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  useEffect(() => {
    if (currentHour && !isNaN(Number(currentHour))) {
      setNextServiceHour(Number(currentHour) + 250);
    } else {
      setNextServiceHour('');
    }
  }, [currentHour]);

  useEffect(() => {
    if (serviceDate) {
      const date = new Date(serviceDate);
      if (!isNaN(date.getTime())) {
        // Add 6 months
        date.setMonth(date.getMonth() + 6);
        setNextServiceDate(date.toISOString().split('T')[0]);
      }
    } else {
      setNextServiceDate('');
    }
  }, [serviceDate]);

  // Handlers
  const handleChecklistToggle = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhoto(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setGensetName('');
    setMechanicName('');
    setPhoneNumber('');
    setCurrentHour('');
    setServiceDate('');
    setChecklist({});
    setPhoto(null);
    setSubmitStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let photoUrl = null;

      // 1. Upload Photo if selected
      if (photo) {
        // Create a unique file name: timestamp-random.ext
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('service-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('service-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // 2. Insert Data into Database
      const { error: insertError } = await supabase
        .from('genset_logs')
        .insert([
          {
            contractor,
            location,
            genset_name: gensetName,
            mechanic_name: mechanicName,
            phone_number: phoneNumber,
            current_hour: Number(currentHour),
            next_service_hour: Number(nextServiceHour),
            service_date: serviceDate,
            next_service_date: nextServiceDate,
            checklist: checklist, // stored as JSONB
            photo_url: photoUrl
          }
        ]);

      if (insertError) throw insertError;

      // Success
      setSubmitStatus('success');
      console.log("--- Log Saved to Supabase ---");

    } catch (error) {
      console.error('Error submitting log:', error);
      alert('Failed to save the log. Please check your internet connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg border-t-4 border-red-600 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Log Saved Successfully!</h2>
        <p className="text-gray-500 text-center mb-6">The maintenance record has been recorded in the central database.</p>
        <button 
          onClick={resetForm}
          className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-md"
        >
          Add Another Log
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 border-b-4 border-red-600">
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-500" />
            New Maintenance Record
          </h2>
          <p className="text-slate-400 text-sm mt-1">Please ensure all details are accurate per HSE standards.</p>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Section 1: General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="w-4 h-4 text-red-600" /> Contractor
              </label>
              <div className="relative">
                <select
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block transition-shadow"
                >
                  {CONTRACTORS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-600" /> Site / Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block transition-shadow"
              >
                {LOCATIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Genset Asset ID</label>
              <input
                required
                type="text"
                value={gensetName}
                onChange={(e) => setGensetName(e.target.value)}
                placeholder="e.g. TE-ADD-G01"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition-shadow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Technician Name</label>
              <input
                required
                type="text"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition-shadow"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="w-4 h-4 text-red-600" /> Technician Contact
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition-shadow"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Hours & Dates (Calculations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/30 p-6 rounded-xl border border-red-100">
            
            {/* Hours */}
            <div className="space-y-4">
              <h3 className="text-red-800 font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" /> Running Hours
              </h3>
              <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-red-600 tracking-wider">Current Hour (RH)</label>
                  <input
                    required
                    type="number"
                    value={currentHour}
                    onChange={(e) => setCurrentHour(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full p-2.5 bg-white border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 font-mono text-lg transition-shadow"
                  />
              </div>
              <div className="space-y-2 opacity-80">
                  <label className="text-xs uppercase font-bold text-red-600 tracking-wider">Next Service Hour (+250)</label>
                  <input
                    readOnly
                    type="number"
                    value={nextServiceHour}
                    className="w-full p-2.5 bg-red-50 border border-red-200 rounded-lg text-gray-600 font-mono cursor-not-allowed"
                  />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-red-800 font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Schedule
              </h3>
              <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-red-600 tracking-wider">Service Date</label>
                  <input
                    required
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-shadow"
                  />
              </div>
              <div className="space-y-2 opacity-80">
                  <label className="text-xs uppercase font-bold text-red-600 tracking-wider">Next Service Date (+6 Mo)</label>
                  <input
                    readOnly
                    type="date"
                    value={nextServiceDate}
                    className="w-full p-2.5 bg-red-50 border border-red-200 rounded-lg text-gray-600 cursor-not-allowed"
                  />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gray-500" /> Maintenance Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHECKLIST_ITEMS.map((item) => (
                <label 
                  key={item} 
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    checklist[item] 
                      ? 'bg-red-50 border-red-200 text-red-900 shadow-sm' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checklist[item]}
                    onChange={() => handleChecklistToggle(item)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 mr-3 accent-red-600"
                  />
                  <span className="font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              Evidence Photo <span className="text-xs text-gray-400 font-normal">(Required)</span>
            </label>
            
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="w-full">
              {photo ? (
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-300 bg-red-50 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-sm text-red-700 font-medium">{photo.name}</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        setPhoto(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Remove & Change
                    </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                    <Camera className="w-6 h-6 text-slate-600 group-hover:text-red-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-800">
                    Tap to Capture or Upload Photo
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Supports JPG, PNG (Mobile opens Camera)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                  By submitting this form, you confirm that all checklist items have been physically verified on the genset unit.
              </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all focus:ring-4 focus:ring-red-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Record...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Submit Maintenance Log
              </>
            )}
          </button>

        </div>
      </form>
    </>
  );
};
