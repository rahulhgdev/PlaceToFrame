import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="custom-select" ref={selectRef}>
      <button
        className="select-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || 'Select theme'}</span>
        <ChevronDown 
          size={18} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.2s',
            flexShrink: 0
          }} 
        />
      </button>
      {isOpen && (
        <div className="select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className="select-option"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div className="option-label">{option.label}</div>
              <div className="option-desc">{option.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
