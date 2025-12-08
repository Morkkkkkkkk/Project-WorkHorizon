import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; // (เราจะสร้าง Hook นี้ในขั้นตอนถัดไป)

/**
 * Combobox ค้นหาได้, เลือกได้, พิมพ์ใหม่ได้
 * @param {object} props
 * @param {Function} props.fetchFunction - (เช่น masterDataApi.getCategories)
 * @param {object} props.value - (Object ที่เลือก, เช่น { id, name })
 * @param {Function} props.onChange - (Callback)
 * @param {string} props.placeholder
 * @param {boolean} [props.disabled]
 * @param {object} [props.fetchParams] - (สำหรับ District ที่ต้องส่ง provinceId)
 */
const SearchableCombobox = ({ fetchFunction, value, onChange, placeholder, disabled = false, fetchParams = {}, allowCreate = true }) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // (Debounce) หน่วงเวลาค้นหา
  const debouncedQuery = useDebounce(query, 300);

  const fetchParamsKey = JSON.stringify(fetchParams);
  // (Effect) ดึงข้อมูลเมื่อ query เปลี่ยน
  useEffect(() => {
    if (disabled) {
        setItems([]);
        setIsLoading(false); // (เพิ่ม) หยุด Loading ถ้า disabled
        return;
    }
    setIsLoading(true);

    //  ปรับการส่ง Argument: ส่ง fixedParams (เช่น provinceId) ก่อน แล้วตามด้วย query
    const fixedParams = Object.values(fetchParams);
    
    fetchFunction(...fixedParams, debouncedQuery) // [FIX]: Pass fixed params first, then debounced query
      .then(data => setItems(data))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, fetchFunction, disabled, fetchParamsKey]);


 // (Logic) "สร้างใหม่"
  let newItem = null;
  if (allowCreate && query.length > 0 && !items.some(item => item.name.toLowerCase() === query.toLowerCase())){
    newItem = { id: null, name: query }; 
  }

 //  Logic การเลือก (รวม "สร้างใหม่" ไว้ที่นี่)
  const handleOnChange = (selectedValue) => {
    if (!selectedValue) {
      onChange(null); // (ส่ง null กลับไป)
      setQuery(''); // (เคลียร์ช่องค้นหา)
      return;
    }
    onChange(selectedValue);
    setQuery(''); 
  }

  

  return (
    <Combobox value={value} onChange={handleOnChange} disabled={disabled}>
      <div className="relative">
        <div className="form-input p-0 flex items-center">
          <Combobox.Input
            className="w-full pl-3 pr-10 py-2 border-none rounded-lg focus:ring-0 sm:text-sm"
            displayValue={(item) => item?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
          {isLoading && <div className="px-4 py-2 text-gray-500">กำลังโหลด...</div>}
          
          {/* (เพิ่ม "สร้างใหม่") */}
          {newItem && (
            <Combobox.Option
              value={newItem}
              className={({ active }) => `relative cursor-default select-none py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
            >
              + สร้าง "{newItem.name}"
            </Combobox.Option>
          )}

          {items.length === 0 && query !== '' && !newItem && !isLoading && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              ไม่พบข้อมูล
            </div>
          )}
          
          {items.map((item) => (
            <Combobox.Option
              key={item.id}
              value={item}
              className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {item.name}
                  </span>
                  {selected ? (
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default SearchableCombobox;