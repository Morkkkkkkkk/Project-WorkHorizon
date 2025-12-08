import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; 

/**
 * Combobox สำหรับ "Skills" (เลือกหลายอัน)
 * @param {object} props
 * @param {Function} props.fetchFunction - (เช่น masterDataApi.getSkills)
 * @param {Array} props.value - (Array ของ Object ที่เลือก, เช่น [{ id, name }])
 * @param {Function} props.onChange - (Callback)
 * @param {string} props.placeholder
 */
const SearchableMultiCombobox = ({ fetchFunction, value = [], onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setIsLoading(true);
    fetchFunction(debouncedQuery)
      .then(data => setItems(data))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, fetchFunction]);
  
  // (Logic) กรองอันที่ "ยังไม่ถูกเลือก" ออก
  const availableItems = items.filter(
    item => !value.some(v => v.id === item.id)
  );

  // (Logic) "สร้างใหม่"
  let newItem = null;
  if (query.length > 0 && !availableItems.some(item => item.name.toLowerCase() === query.toLowerCase()) && !value.some(item => item.name.toLowerCase() === query.toLowerCase())) {
    newItem = { id: null, name: query };
  }

  const handleSelect = (selected) => {
    // "ดักจับ" ค่า null (เมื่อคลิกออก)
    if (!selected) {
        setQuery(''); // เครียร์ช่องค้นหา
        return;
    }
    if (selected.id) { // (เลือกจาก List)
      onChange([...value, selected]);
    } else { // (สร้างใหม่)
      onChange([...value, { name: selected.name }]);
    }
    setQuery(''); // (เคลียร์ช่องค้นหา)
  };

  const handleRemove = (itemToRemove) => {
    if(itemToRemove.id) {
      onChange(value.filter(item => item.id !== itemToRemove.id));
    } else {
      onChange(value.filter(item => item.name !== itemToRemove.name));
    }
  };

  return (
    <div>
      {/* 1. (แสดง Badges/Tags ที่เลือกแล้ว) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(item => (
          <span key={item.id || item.name} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            {item.name}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="text-blue-400 hover:text-blue-700"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      
      {/* 2. (Combobox) */}
      <Combobox onChange={handleSelect}>
        <div className="relative">
          <div className="form-input p-0 flex items-center">
            <Combobox.Input
              className="w-full pl-3 pr-10 py-2 border-none rounded-lg focus:ring-0 sm:text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              value={query} // (ให้แสดง query ไม่ใช่ value)
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
            {isLoading && <div className="px-4 py-2 text-gray-500">กำลังโหลด...</div>}
            
            {newItem && (
              <Combobox.Option
                value={newItem}
                className={({ active }) => `relative cursor-default select-none py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
              >
                + สร้าง "{newItem.name}"
              </Combobox.Option>
            )}

            {availableItems.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
              >
                {({ active }) => (
                  <>
                    <span className="block truncate font-normal">
                      {item.name}
                    </span>
                    {active && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};

export default SearchableMultiCombobox;