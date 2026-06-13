'use client';

import React, { useState } from 'react';
import { CATEGORIES, SEVERITIES, SEVERITY_COLORS } from '@/lib/constants';
import { IncidentCategory, IncidentSeverity } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FormErrors {
  title?: string;
  store_location?: string;
  category?: string;
  severity?: string;
  description?: string;
}

const SEVERITY_DOT_COLORS: Record<IncidentSeverity, string> = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-orange-500',
  Critical: 'bg-red-500',
};

export default function IncidentForm() {
  const [title, setTitle] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [severity, setSeverity] = useState<IncidentSeverity | ''>('');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [aiSuggestion, setAiSuggestion] = useState<{
    summary: string;
    suggested_category: string;
    suggested_severity: string;
    reasoning: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Incident title is required.';
    if (!storeLocation.trim()) newErrors.store_location = 'Store location is required.';
    if (!category) newErrors.category = 'Please select a category.';
    if (!severity) newErrors.severity = 'Please select a severity level.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const analyzeWithAI = async () => {
    setAiError('');
    setAiSuggestion(null);

    if (!title.trim() || !description.trim()) {
      setAiError('Title and description are required for AI analysis.');
      return;
    }

    if (description.trim().length < 10) {
      setAiError('Description must be at least 10 characters long.');
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI Analysis failed.');
      }

      setAiSuggestion(data);
    } catch (err: any) {
      setAiError(err.message || 'Failed to complete AI analysis.');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAISuggestion = () => {
    if (!aiSuggestion) return;
    setCategory(aiSuggestion.suggested_category as IncidentCategory);
    setSeverity(aiSuggestion.suggested_severity as IncidentSeverity);
    setAiSuggestion(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          store_location: storeLocation.trim(),
          category,
          severity,
          description: description.trim(),
          reported_by: reportedBy.trim() || undefined,
          ai_summary: aiSuggestion?.summary || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit incident report. Please try again.');
      }

      setSuccessId(data.id || 'Unknown ID');
      // Reset form
      setTitle('');
      setStoreLocation('');
      setCategory('');
      setSeverity('');
      setDescription('');
      setReportedBy('');
      setErrors({});
      setAiSuggestion(null);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <Card className="border-green-200 bg-green-50/50 shadow-sm max-w-2xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-900 font-sans">Incident Reported</h3>
            <p className="text-green-700 max-w-md">
              Incident reported successfully!
            </p>
            <p className="text-sm font-mono bg-white border border-green-200 rounded px-3 py-1.5 text-green-800 break-all">
              Incident ID: {successId}
            </p>
          </div>
          <Button 
            onClick={() => setSuccessId(null)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white"
          >
            Report Another Incident
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Submission Error:</span> {error}
            </div>
          </div>
        )}

        {/* Section 1: Incident Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Incident Details</h3>
            <p className="text-xs text-slate-500">Provide the core details of the operational issue.</p>
          </div>
          <hr className="border-slate-100" />

          {/* Incident Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Incident Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. POS terminal not responding at counter 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
            />
            {errors.title && <p className="text-xs font-medium text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={category} 
                onValueChange={(val) => setCategory(val as IncidentCategory)}
              >
                <SelectTrigger
                  id="category"
                  className={errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs font-medium text-red-600">{errors.category}</p>}
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-medium text-slate-700">
                Severity Level <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={severity} 
                onValueChange={(val) => setSeverity(val as IncidentSeverity)}
              >
                <SelectTrigger
                  id="severity"
                  className={errors.severity ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}
                >
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${SEVERITY_DOT_COLORS[sev]}`} />
                        {sev}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && <p className="text-xs font-medium text-red-600">{errors.severity}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the incident in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
            />
            {errors.description && <p className="text-xs font-medium text-red-600">{errors.description}</p>}
          </div>

          {/* AI Analysis Block */}
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={!title.trim() || !description.trim() || aiLoading}
              onClick={analyzeWithAI}
              className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors h-10 font-medium"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Analyze with AI
                </>
              )}
            </Button>

            {aiError && (
              <p className="text-xs font-medium text-red-600">{aiError}</p>
            )}

            {aiSuggestion && (
              <Card className="border-indigo-200 bg-indigo-50/40 shadow-xs overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
                    <span>✨</span>
                    <span>AI Analysis</span>
                  </div>
                  
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {aiSuggestion.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Suggested Category:</span>
                      <span className="text-sm font-medium text-slate-900">{aiSuggestion.suggested_category}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Suggested Severity:</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        SEVERITY_COLORS[aiSuggestion.suggested_severity as IncidentSeverity] || ''
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          SEVERITY_DOT_COLORS[aiSuggestion.suggested_severity as IncidentSeverity] || ''
                        }`} />
                        {aiSuggestion.suggested_severity}
                      </span>
                    </div>
                  </div>

                  {aiSuggestion.reasoning && (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 block mb-0.5">Reasoning:</span>
                      <span className="text-slate-600 italic leading-relaxed">{aiSuggestion.reasoning}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={acceptAISuggestion}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 font-medium px-3"
                    >
                      Apply Suggestions
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAiSuggestion(null)}
                      className="text-slate-500 hover:text-slate-800 text-xs h-8 font-medium px-3 hover:bg-slate-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section 2: Location & Reporter */}
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Location & Reporter</h3>
            <p className="text-xs text-slate-500">Provide where the incident occurred and who is reporting it.</p>
          </div>
          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Location */}
            <div className="space-y-2">
              <Label htmlFor="storeLocation" className="text-sm font-medium text-slate-700">
                Store Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeLocation"
                placeholder="e.g. Koramangala Branch, Bengaluru"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className={errors.store_location ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}
              />
              {errors.store_location && (
                <p className="text-xs font-medium text-red-600">{errors.store_location}</p>
              )}
            </div>

            {/* Reported By */}
            <div className="space-y-2">
              <Label htmlFor="reportedBy" className="text-sm font-medium text-slate-700">
                Reported By <span className="text-slate-500 text-xs">(optional)</span>
              </Label>
              <Input
                id="reportedBy"
                placeholder="Your name (optional)"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mt-6"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reporting Incident...
            </span>
          ) : (
            'Report Incident'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
