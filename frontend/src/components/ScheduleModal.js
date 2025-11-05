import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ScheduleModal.css';

const ScheduleModal = ({ link, onSave, onClose }) => {
  const [enabled, setEnabled] = useState(link?.schedule?.enabled || false);
  const [startDate, setStartDate] = useState(
    link?.schedule?.startDate ? new Date(link.schedule.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    link?.schedule?.endDate ? new Date(link.schedule.endDate).toISOString().slice(0, 16) : ''
  );

  const handleSave = () => {
    onSave({
      enabled,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null
    });
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <h3>Schedule Link</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="schedule-modal-content">
          <p className="link-title">{link?.title}</p>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>Enable scheduling</span>
            </label>
          </div>

          {enabled && (
            <>
              <div className="form-group">
                <label>Start Date & Time (optional)</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="datetime-input"
                />
                <small>Link will be hidden before this date/time</small>
              </div>

              <div className="form-group">
                <label>End Date & Time (optional)</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="datetime-input"
                />
                <small>Link will be hidden after this date/time</small>
              </div>
            </>
          )}
        </div>

        <div className="schedule-modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
