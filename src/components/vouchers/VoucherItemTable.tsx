import React from 'react';
import { Plus, Trash2, ArrowRightCircle, ArrowLeftCircle, DollarSign, StickyNote, Package, Landmark } from 'lucide-react';
import { TransactionItem, VoucherType } from '../../types/accounting';
import { Autocomplete } from '../ui/Autocomplete';

interface VoucherItemTableProps {
  items: TransactionItem[];
  type: VoucherType;
  isViewOnly?: boolean;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: keyof TransactionItem, value: any) => void;
  isInventoryType: boolean;
}

export const VoucherItemTable: React.FC<VoucherItemTableProps> = ({
  items,
  type,
  isViewOnly,
  onAddItem,
  onRemoveItem,
  onItemChange,
  isInventoryType
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightCircle size={18} className="text-indigo-600" />
          Chi tiết hạch toán
        </h3>
        {!isViewOnly && (
          <button 
            type="button"
            onClick={onAddItem}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Thêm dòng
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {type !== 'GoldCurrencyList' && (
                <>
                  <div className="md:col-span-3">
                    <Autocomplete 
                      collectionName="accounts"
                      searchField="code"
                      displayField="name"
                      valueField="code"
                      label="Tài khoản Nợ"
                      placeholder="152"
                      value={item.debitAccount}
                      onChange={(val) => onItemChange(index, 'debitAccount', val)}
                      disabled={isViewOnly}
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Autocomplete 
                      collectionName="accounts"
                      searchField="code"
                      displayField="name"
                      valueField="code"
                      label="Tài khoản Có"
                      placeholder="331"
                      value={item.creditAccount}
                      onChange={(val) => onItemChange(index, 'creditAccount', val)}
                      disabled={isViewOnly}
                      required
                    />
                  </div>
                </>
              )}
              <div className={type === 'GoldCurrencyList' ? 'md:col-span-9 space-y-1' : 'md:col-span-3 space-y-1'}>
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <DollarSign size={10} className="text-emerald-600" />
                  Số tiền
                </label>
                <input 
                  type="number" 
                  required
                  value={item.amount}
                  onChange={(e) => onItemChange(index, 'amount', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <StickyNote size={10} className="text-slate-400" />
                  Ghi chú
                </label>
                <input 
                  type="text" 
                  value={item.note}
                  onChange={(e) => onItemChange(index, 'note', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-lg bg-white border border-slate-200 focus:border-blue-500 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  disabled={isViewOnly || items.length === 1}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {isInventoryType && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2 border-t border-slate-200 border-dashed items-end">
                <div className="md:col-span-1">
                  <Autocomplete 
                    collectionName="products"
                    searchField="code"
                    displayField="name"
                    valueField="code"
                    label={type === 'GoldCurrencyList' ? 'Mã số' : 'Mã hàng'}
                    placeholder="VT001"
                    value={item.itemCode || ''}
                    onChange={(val, product) => {
                      onItemChange(index, 'itemCode', val);
                      if (product) {
                        onItemChange(index, 'itemName', product.name);
                        onItemChange(index, 'unit', product.unit);
                        if (type === 'GoodsReceived' || type === 'Purchase') {
                          onItemChange(index, 'price', product.purchasePrice || 0);
                          onItemChange(index, 'vatRate', 10);
                          onItemChange(index, 'vatAmount', ((item.amount || 0) * 10) / 100);
                        } else if (type === 'GoodsDelivered' || type === 'Sales') {
                          onItemChange(index, 'price', product.salePrice || 0);
                          onItemChange(index, 'vatRate', 10);
                          onItemChange(index, 'vatAmount', ((item.amount || 0) * 10) / 100);
                        }
                      }
                    }}
                    disabled={isViewOnly}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    {type === 'GoldCurrencyList' ? 'Tên, loại, quy cách' : 'Tên hàng'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={type === 'GoldCurrencyList' ? 'Tên, loại vàng...' : 'Tên vật tư...'}
                    value={item.itemName}
                    onChange={(e) => onItemChange(index, 'itemName', e.target.value)}
                    disabled={isViewOnly}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">ĐVT</label>
                  <input 
                    type="text" 
                    placeholder="Cái/Kg..."
                    value={item.unit}
                    onChange={(e) => onItemChange(index, 'unit', e.target.value)}
                    disabled={isViewOnly}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs"
                  />
                </div>
                {type !== 'GoldCurrencyList' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      {type === 'GoodsReceived' ? 'Số lượng (HĐ)' : 'Số lượng (YC)'}
                    </label>
                    <input 
                      type="number" 
                      value={item.quantityPlanned}
                      onChange={(e) => onItemChange(index, 'quantityPlanned', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    {type === 'GoodsReceived' ? 'Thực nhập' : 
                     type === 'GoldCurrencyList' ? 'Số lượng' : 'Thực xuất'}
                  </label>
                  <input 
                    type="number" 
                    value={item.quantityActual}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      onItemChange(index, 'quantityActual', qty);
                      const amount = qty * (item.price || 0);
                      onItemChange(index, 'amount', amount);
                      if (item.vatRate !== undefined) {
                        onItemChange(index, 'vatAmount', (amount * item.vatRate) / 100);
                      }
                    }}
                    disabled={isViewOnly}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Đơn giá</label>
                  <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => {
                      const price = Number(e.target.value);
                      onItemChange(index, 'price', price);
                      const amount = (item.quantityActual || 0) * price;
                      onItemChange(index, 'amount', amount);
                      if (item.vatRate !== undefined) {
                        onItemChange(index, 'vatAmount', (amount * item.vatRate) / 100);
                      }
                    }}
                    disabled={isViewOnly}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs"
                  />
                </div>
                {(type === 'Sales' || type === 'Purchase' || type === 'GoodsDelivered' || type === 'GoodsReceived') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Thuế (%)</label>
                      <select
                        value={item.vatRate || 0}
                        onChange={(e) => {
                          const rate = Number(e.target.value);
                          onItemChange(index, 'vatRate', rate);
                          onItemChange(index, 'vatAmount', ((item.amount || 0) * rate) / 100);
                        }}
                        disabled={isViewOnly}
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 outline-none text-xs"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={8}>8%</option>
                        <option value={10}>10%</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Tiền thuế</label>
                      <input 
                        type="number" 
                        value={item.vatAmount || 0}
                        onChange={(e) => onItemChange(index, 'vatAmount', Number(e.target.value))}
                        disabled={isViewOnly}
                        className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none text-xs font-bold text-emerald-600"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
