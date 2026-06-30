import { useState } from 'react';
import { Upload, Download, CheckCircle, AlertTriangle, Play, RefreshCw, X } from 'lucide-react';
import api from '../services/api';
import { categories, conditions } from '../utils/constants';


// RFC 4180 standard compliant CSV parser (handles commas and quotes in values)
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let insideQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

export default function CSVImporter({ onImportComplete }) {
  const [validTools, setValidTools] = useState([]);
  const [invalidTools, setInvalidTools] = useState([]);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "name,category,description,condition,daily_rate,image_url,blackout_dates\n"
      + 'Hammer,Power Tools,"Heavy hammer for general use",Good,15.50,,\n'
      + 'Lawn Mower,Gardening,"Gas powered push mower with bagger",Excellent,45.00,,2026-07-04\n'
      + 'Screwdriver Set,Carpentry,"12-piece magnetic precision set",New,10.00,,\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "neighborshare_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      setFileName('');
      setValidTools([]);
      setInvalidTools([]);
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsedLines = parseCSV(text);
        
        if (parsedLines.length < 2) {
          setError('The CSV file is empty or contains only a header.');
          setValidTools([]);
          setInvalidTools([]);
          return;
        }

        const rawHeaders = parsedLines[0];
        const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ''));

        // Look up column indices
        const idxName = headers.findIndex(h => h === 'name' || h === 'toolname');
        const idxCategory = headers.findIndex(h => h === 'category');
        const idxDescription = headers.findIndex(h => h === 'description' || h === 'desc');
        const idxCondition = headers.findIndex(h => h === 'condition');
        const idxDailyRate = headers.findIndex(h => h === 'dailyrate' || h === 'rate' || h === 'price');
        const idxImageUrl = headers.findIndex(h => h === 'imageurl' || h === 'image');
        const idxBlackoutDates = headers.findIndex(h => h === 'blackoutdates' || h === 'blackout');

        if (idxName === -1 || idxDailyRate === -1) {
          setError('CSV must contain at least "name" and "daily_rate" (or "rate"/"price") columns.');
          setValidTools([]);
          setInvalidTools([]);
          return;
        }

        const records = [];
        const errorRecords = [];

        for (let i = 1; i < parsedLines.length; i++) {
          const row = parsedLines[i];
          if (row.length === 1 && row[0] === '') continue; // Skip empty rows

          const rowNum = i + 1;
          const name = row[idxName]?.trim() || '';
          const dailyRateRaw = row[idxDailyRate]?.trim() || '';
          const categoryRaw = idxCategory !== -1 ? row[idxCategory]?.trim() : '';
          const descriptionRaw = idxDescription !== -1 ? row[idxDescription]?.trim() : '';
          const conditionRaw = idxCondition !== -1 ? row[idxCondition]?.trim() : '';
          const imageUrlRaw = idxImageUrl !== -1 ? row[idxImageUrl]?.trim() : '';
          const blackoutDatesRaw = idxBlackoutDates !== -1 ? row[idxBlackoutDates]?.trim() : '';

          const rowErrors = [];

        
          if (!name) {
            rowErrors.push('Name is required.');
          } else if (name.length < 2 || name.length > 100) {
            rowErrors.push('Name must be between 2 and 100 characters.');
          }

        
          const daily_rate = parseFloat(dailyRateRaw);
          if (isNaN(daily_rate)) {
            rowErrors.push('Daily rate must be a valid number.');
          } else if (daily_rate <= 0 || daily_rate > 10000) {
            rowErrors.push('Daily rate must be greater than 0 and up to 10,000.');
          }

        
          let category = 'Other';
          if (categoryRaw) {
            const matchedCat = categories.find(c => c.toLowerCase() === categoryRaw.toLowerCase());
            if (matchedCat) {
              category = matchedCat;
            }
          }

          
          let condition = 'Good';
          if (conditionRaw) {
            const matchedCond = conditions.find(c => c.toLowerCase() === conditionRaw.toLowerCase());
            if (matchedCond) {
              condition = matchedCond;
            }
          }

          
          let description = descriptionRaw;
          if (!description || description.length < 10) {
            description = `High quality ${name || 'tool'} available for rent. Condition is ${condition.toLowerCase()}.`;
          }
          if (description.length > 2000) {
            description = description.substring(0, 1997) + '...';
          }

          // Image URL validation and resolution
          let image_url = '';
          if (imageUrlRaw) {
            try {
              new URL(imageUrlRaw);
              image_url = imageUrlRaw;
            } catch (_) {
              image_url = categoryImages[category] || categoryImages['Other'];
            }
          } else {
            image_url = categoryImages[category] || categoryImages['Other'];
          }

          
          let blackout_dates = [];
          if (blackoutDatesRaw) {
            const dateStrings = blackoutDatesRaw.split(',').map(d => d.trim()).filter(Boolean);
            for (const ds of dateStrings) {
              const parsedD = Date.parse(ds);
              if (isNaN(parsedD) || !/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
                rowErrors.push(`Invalid date "${ds}" (must be YYYY-MM-DD).`);
              } else {
                blackout_dates.push(ds);
              }
            }
          }

          if (rowErrors.length > 0) {
            errorRecords.push({
              rowNum,
              name: name || `(Row ${rowNum})`,
              errors: rowErrors
            });
          } else {
            records.push({
              name,
              category,
              description,
              condition,
              daily_rate,
              image_url,
              blackout_dates
            });
          }
        }

        setValidTools(records);
        setInvalidTools(errorRecords);
      } catch (err) {
        setError('Failed to read CSV. Please verify that the file format is standard.');
      }
    };
    reader.readAsText(file);
  };

  const importTools = async () => {
    if (validTools.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validTools.length; i++) {
      const tool = validTools[i];
      try {
        await api.post('/tools', tool);
        successCount++;
      } catch (err) {
        failCount++;
      }
      setImportProgress(Math.round(((i + 1) / validTools.length) * 100));
    }

    setIsImporting(false);
    setValidTools([]);
    setInvalidTools([]);
    setFileName('');
    onImportComplete(`Successfully imported ${successCount} tools!${failCount > 0 ? ` Failed to import ${failCount} tools.` : ''}`);
  };

  const clearFile = () => {
    setFileName('');
    setValidTools([]);
    setInvalidTools([]);
    setError('');
  };

  return (
    <div className="space-y-4">
      
      {!fileName && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
            dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-stone-300 hover:border-primary/50 bg-stone-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="csv-file-input"
            className="hidden"
            accept=".csv"
            onChange={handleFileSelection}
          />
          <label htmlFor="csv-file-input" className="cursor-pointer block space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-primary block">Click to upload or drag & drop</span>
              <span className="text-xs text-stone-500">Only .csv files are supported</span>
            </div>
          </label>
          <button
            onClick={downloadTemplate}
            className="mt-4 text-xs font-semibold text-stone-600 hover:text-primary flex items-center gap-1.5 mx-auto"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV Template
          </button>
        </div>
      )}

      
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      
      {isImporting && (
        <div className="card p-5 space-y-3 text-center border border-primary/20">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            <h3 className="font-bold text-primary">Auto-Generating Tools...</h3>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            ></div>
          </div>
          <p className="text-xs font-medium text-stone-500">{importProgress}% completed</p>
        </div>
      )}

      
      {fileName && !isImporting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-3 rounded-lg">
            <div className="truncate pr-4">
              <span className="text-xs text-stone-500 block">Uploaded File</span>
              <span className="text-sm font-bold text-primary truncate">{fileName}</span>
            </div>
            <button onClick={clearFile} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3 text-center border-l-4 border-l-green-500 bg-green-50/20">
              <div className="flex justify-center mb-1 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs text-stone-500 block">Valid Records</span>
              <span className="text-lg font-black text-stone-800">{validTools.length}</span>
            </div>
            <div className="card p-3 text-center border-l-4 border-l-amber-500 bg-amber-50/20">
              <div className="flex justify-center mb-1 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs text-stone-500 block">Invalid Records</span>
              <span className="text-lg font-black text-stone-800">{invalidTools.length}</span>
            </div>
          </div>

          
          {invalidTools.length > 0 && (
            <div className="card p-4 border border-amber-200 bg-amber-50/10 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Validation Issues</h4>
              <div className="max-h-36 overflow-auto text-xs space-y-1.5 divide-y divide-amber-100 pr-1">
                {invalidTools.map((record, index) => (
                  <div key={index} className="pt-1.5 first:pt-0">
                    <span className="font-bold text-amber-900">{record.name} (Row {record.rowNum}):</span>
                    <ul className="list-disc pl-4 text-stone-600 mt-0.5 space-y-0.5">
                      {record.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {validTools.length > 0 && (
            <div className="card overflow-hidden border border-stone-200">
              <div className="bg-stone-50 p-2.5 border-b border-stone-200">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide">Import Preview ({validTools.length})</h4>
              </div>
              <div className="max-h-48 overflow-auto">
                <table className="w-full text-left text-xs divide-y divide-stone-100">
                  <thead className="bg-stone-50/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-stone-500">Name</th>
                      <th className="p-2 text-stone-500">Category</th>
                      <th className="p-2 text-stone-500">Condition</th>
                      <th className="p-2 text-stone-500 text-right">Daily Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {validTools.map((tool, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="p-2 font-semibold text-stone-800 truncate max-w-[120px]">{tool.name}</td>
                        <td className="p-2 text-stone-600">{tool.category}</td>
                        <td className="p-2 text-stone-600">{tool.condition}</td>
                        <td className="p-2 text-stone-800 font-bold text-right">Rs {tool.daily_rate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          
          <button
            disabled={validTools.length === 0}
            onClick={importTools}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition text-sm ${
              validTools.length > 0 
                ? 'btn-primary shadow-soft' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <Play className="w-4 h-4" /> Import {validTools.length} Valid Tool{validTools.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
