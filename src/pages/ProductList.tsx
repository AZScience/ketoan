import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, ProductType, Voucher } from '../types/accounting';
import { logAudit } from '../lib/audit';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, Package, Tag, Ruler, DollarSign, Book, Copy, Hash, Layers, Info, Settings, History, Calendar, FileText, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkingContext } from '../context/WorkingContext';

const ProductList: React.FC = () => {
  const { workingYear, workingMonth } = useWorkingContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ProductType | 'All'>('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState<ProductType>('Goods');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [inventoryAccount, setInventoryAccount] = useState('');
  const [openingQty, setOpeningQty] = useState<number>(0);
  const [openingValue, setOpeningValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockWarningThreshold, setStockWarningThreshold] = useState<number>(0);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    const monthStr = workingMonth.toString().padStart(2, '0');
    const startOfPeriod = `${workingYear}-${monthStr}-01`;
    const lastDay = new Date(workingYear, workingMonth, 0).getDate();
    const endOfPeriod = `${workingYear}-${monthStr}-${lastDay}`;

    const vq = query(
      collection(db, 'vouchers'), 
      where('date', '>=', startOfPeriod),
      where('date', '<=', endOfPeriod),
      orderBy('date', 'desc')
    );
    const unsubscribeV = onSnapshot(vq, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      setVouchers(allVouchers.filter(v => v.status === 'Posted'));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
    });

    return () => {
      unsubscribe();
      unsubscribeV();
    };
  }, [workingYear, workingMonth]);

  const productMovements = useMemo(() => {
    if (!editingProductId) return [];
    const product = products.find(p => p.id === editingProductId);
    if (!product) return [];

    const movements: any[] = [];
    vouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.itemCode === product.code) {
          const isInventoryAccount = (acc?: string) => 
            acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

          const isImport = isInventoryAccount(item.debitAccount);
          const isExport = isInventoryAccount(item.creditAccount);

          if (isImport || isExport) {
            movements.push({
              date: v.date,
              number: v.number,
              type: v.type,
              quantity: item.quantityActual || 0,
              amount: item.amount || 0,
              isImport,
              isExport,
              description: v.description
            });
          }
        }
      });
    });

    return movements.sort((a, b) => b.date.localeCompare(a.date));
  }, [editingProductId, products, vouchers]);

  const productStocks = useMemo(() => {
    const stocks: Record<string, number> = {};
    
    products.forEach(p => {
      stocks[p.code] = p.openingQty || 0;
    });

    vouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.itemCode && stocks[item.itemCode] !== undefined) {
          const isInventoryAccount = (acc?: string) => 
            acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

          const isImport = isInventoryAccount(item.debitAccount);
          const isExport = isInventoryAccount(item.creditAccount);

          if (isImport) stocks[item.itemCode] += (item.quantityActual || 0);
          if (isExport) stocks[item.itemCode] -= (item.quantityActual || 0);
        }
      });
    });

    return stocks;
  }, [products, vouchers]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const generateDefaultCode = (productType: ProductType) => {
    const prefix = productType === 'Goods' ? 'HH' : 
                   productType === 'Service' ? 'DV' : 
                   productType === 'Material' ? 'NVL' : 'TP';
    const count = products.filter(p => p.type === productType).length + 1;
    return `${prefix}${count.toString().padStart(3, '0')}`;
  };

  const resetForm = () => {
    setEditingProductId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    const defaultType: ProductType = filterType !== 'All' ? filterType : 'Goods';
    setCode(generateDefaultCode(defaultType));
    setName('');
    setUnit('');
    setType(defaultType);
    setPurchasePrice(0);
    setSalePrice(0);
    setInventoryAccount('');
    setOpeningQty(0);
    setOpeningValue(0);
    setDescription('');
    setImageUrl('');
    setStockWarningThreshold(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        code,
        name,
        unit,
        type,
        purchasePrice: Number(purchasePrice),
        salePrice: Number(salePrice),
        inventoryAccount,
        openingQty: Number(openingQty),
        openingValue: Number(openingValue),
        description,
        imageUrl,
        stockWarningThreshold: Number(stockWarningThreshold),
        updatedAt: serverTimestamp()
      };

      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), data);
        await logAudit('Products', 'Update', `Updated product ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật vật tư hàng hóa thành công!' });
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
        await logAudit('Products', 'Create', `Created product ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm vật tư hàng hóa mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving product:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || "Có lỗi xảy ra khi lưu thông tin vật tư hàng hóa." 
      });
      handleFirestoreError(error, editingProductId ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p: Product) => {
    setEditingProductId(p.id!);
    setCode(p.code);
    setName(p.name);
    setUnit(p.unit);
    setType(p.type);
    setPurchasePrice(p.purchasePrice || 0);
    setSalePrice(p.salePrice || 0);
    setInventoryAccount(p.inventoryAccount || '');
    setOpeningQty(p.openingQty || 0);
    setOpeningValue(p.openingValue || 0);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setStockWarningThreshold(p.stockWarningThreshold || 0);
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCopy = (p: Product) => {
    setEditingProductId(null);
    setCode(`${p.code}-COPY`);
    setName(p.name);
    setUnit(p.unit);
    setType(p.type);
    setPurchasePrice(p.purchasePrice || 0);
    setSalePrice(p.salePrice || 0);
    setInventoryAccount(p.inventoryAccount || '');
    setOpeningQty(p.openingQty || 0);
    setOpeningValue(p.openingValue || 0);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setStockWarningThreshold(p.stockWarningThreshold || 0);
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleView = (p: Product) => {
    setEditingProductId(p.id!);
    setCode(p.code);
    setName(p.name);
    setUnit(p.unit);
    setType(p.type);
    setPurchasePrice(p.purchasePrice || 0);
    setSalePrice(p.salePrice || 0);
    setInventoryAccount(p.inventoryAccount || '');
    setOpeningQty(p.openingQty || 0);
    setOpeningValue(p.openingValue || 0);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setStockWarningThreshold(p.stockWarningThreshold || 0);
    setIsViewOnly(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (p: Product) => {
    setProductToDelete(p);
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!productToDelete?.id) return;
    
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      await logAudit('Products', 'Delete', `Deleted product ${productToDelete.code} - ${productToDelete.name}`);
      setIsConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa vật tư hàng hóa:", error);
      handleFirestoreError(error, OperationType.DELETE, `products/${productToDelete.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Goods': return 'bg-blue-100 text-blue-700';
      case 'Service': return 'bg-purple-100 text-purple-700';
      case 'Material': return 'bg-amber-100 text-amber-700';
      case 'Product': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Goods': return 'Hàng hóa';
      case 'Service': return 'Dịch vụ';
      case 'Material': return 'Nguyên vật liệu';
      case 'Product': return 'Thành phẩm';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vật tư, Hàng hóa & Dịch vụ</h1>
          <p className="text-slate-500">Quản lý danh mục hàng tồn kho và dịch vụ.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Thêm vật tư hàng hóa
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm theo mã hoặc tên hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-600"
            >
              <option value="All">Tất cả loại</option>
              <option value="Goods">Hàng hóa</option>
              <option value="Service">Dịch vụ</option>
              <option value="Material">Nguyên vật liệu</option>
              <option value="Product">Thành phẩm</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Hiển thị</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dòng</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#1877F2] text-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Hash size={14} className="text-blue-200" /> Mã hàng</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Package size={14} className="text-emerald-200" /> Tên hàng</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Ruler size={14} className="text-emerald-200" /> ĐVT</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Layers size={14} className="text-amber-200" /> Tồn kho</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Plus size={14} className="text-blue-200" /> Tồn đầu</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><DollarSign size={14} className="text-emerald-200" /> Giá trị đầu</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Info size={14} className="text-purple-200" /> Loại</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right border border-white/20">
                  <div className="flex items-center justify-end gap-2"><DollarSign size={14} className="text-rose-200" /> Giá bán</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border border-white/20">
                  <div className="flex items-center justify-center gap-2"><Settings size={14} className="text-slate-200" /> Thao tác</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 border border-slate-100">Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 border border-slate-100">Không tìm thấy vật tư hàng hóa nào</td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const currentStock = productStocks[p.code] || 0;
                  const isLowStock = p.stockWarningThreshold !== undefined && p.stockWarningThreshold > 0 && currentStock < p.stockWarningThreshold;
                  
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${isLowStock ? 'bg-rose-50/50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 border border-slate-100">{p.code}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 border border-slate-100">
                        <div className="flex items-center gap-3">
                          {p.imageUrl && (
                            <img 
                              src={p.imageUrl} 
                              alt={p.name} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {p.name}
                              {isLowStock && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 text-[10px] font-bold animate-pulse">
                                  <Info size={10} /> Sắp hết hàng
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100 font-medium">{p.unit}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100">
                        <div className="flex flex-col">
                          <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>{currentStock}</span>
                          {p.stockWarningThreshold ? (
                            <span className="text-[10px] text-slate-400">Ngưỡng: {p.stockWarningThreshold}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100 text-right font-medium">
                        {p.openingQty || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100 text-right font-medium">
                        {p.openingValue ? formatCurrency(p.openingValue) : '-'}
                      </td>
                      <td className="px-6 py-4 border border-slate-100">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(p.type)}`}>
                          {getTypeText(p.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right border border-slate-100">
                        {p.salePrice ? formatCurrency(p.salePrice) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center relative border border-slate-100">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id!)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {openMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-6 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden text-left"
                              >
                                <button onClick={() => handleView(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                  <Eye size={16} className="text-blue-500" /> Xem chi tiết
                                </button>
                                <button onClick={() => handleEdit(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                  <Edit size={16} className="text-amber-500" /> Chỉnh sửa
                                </button>
                                <button onClick={() => handleCopy(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                  <Copy size={16} className="text-emerald-500" /> Sao chép
                                </button>
                                <div className="h-px bg-slate-50 my-1" />
                                <button onClick={() => handleDelete(p)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                                  <Trash2 size={16} /> Xóa vật tư
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredProducts.length)} trong tổng số {filteredProducts.length} vật tư hàng hóa
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isViewOnly ? 'Chi tiết vật tư hàng hóa' : editingProductId ? 'Chỉnh sửa vật tư hàng hóa' : 'Thêm vật tư hàng hóa mới'}
                  </h2>
                  <p className="text-slate-500 text-sm">Vui lòng điền đầy đủ thông tin danh mục.</p>
                </div>
                <button 
                  onClick={() => !isSubmitting && setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 shadow-sm disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="product-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`${
                        message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                      } border p-4 rounded-2xl flex items-center gap-3 text-sm font-medium`}
                    >
                      {message.type === 'success' ? <Save size={18} /> : <Info size={18} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      Loại <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as ProductType;
                        setType(newType);
                        if (!editingProductId) {
                          setCode(generateDefaultCode(newType));
                        }
                      }}
                      disabled={isViewOnly}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Goods">Hàng hóa</option>
                      <option value="Service">Dịch vụ</option>
                      <option value="Material">Nguyên vật liệu</option>
                      <option value="Product">Thành phẩm</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Package size={16} className="text-blue-500" />
                      Mã hàng <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: HH001"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Package size={16} className="text-blue-500" />
                      Tên hàng <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập tên vật tư, hàng hóa hoặc dịch vụ"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Ruler size={16} className="text-emerald-500" />
                      Đơn vị tính <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        disabled={isViewOnly}
                        placeholder="VD: Cái, Kg, Bộ..."
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all pr-10"
                      />
                      {!isViewOnly && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {['Cái', 'Kg', 'Bộ', 'Mét'].map(u => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setUnit(u)}
                              className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Book size={16} className="text-purple-500" />
                      Tài khoản kho
                    </label>
                    <input 
                      type="text" 
                      value={inventoryAccount}
                      onChange={(e) => setInventoryAccount(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: 1561"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-amber-500" />
                      Giá mua
                    </label>
                    <input 
                      type="number" 
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      disabled={isViewOnly}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-600" />
                      Giá bán
                    </label>
                    <input 
                      type="number" 
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      disabled={isViewOnly}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" />
                      Số lượng tồn đầu kỳ
                    </label>
                    <input 
                      type="number" 
                      value={openingQty}
                      onChange={(e) => setOpeningQty(Number(e.target.value))}
                      disabled={isViewOnly}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-amber-500" />
                      Giá trị tồn đầu kỳ
                    </label>
                    <input 
                      type="number" 
                      value={openingValue}
                      onChange={(e) => setOpeningValue(Number(e.target.value))}
                      disabled={isViewOnly}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Info size={16} className="text-rose-500" />
                      Ngưỡng cảnh báo tồn kho
                    </label>
                    <input 
                      type="number" 
                      value={stockWarningThreshold}
                      onChange={(e) => setStockWarningThreshold(Number(e.target.value))}
                      disabled={isViewOnly}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Info size={16} className="text-slate-500" />
                      Link ảnh sản phẩm (URL)
                    </label>
                    <input 
                      type="text" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="https://example.com/image.jpg"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Info size={16} className="text-slate-500" />
                      Mô tả chi tiết
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập mô tả chi tiết về vật tư hàng hóa..."
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all min-h-[100px]"
                    />
                  </div>
                </div>

                {isViewOnly && (
                  <div className="mt-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <History size={20} className="text-blue-600" />
                        Lịch sử nhập xuất kho
                      </h3>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-slate-500">Nhập kho</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-slate-500">Xuất kho</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            <th className="px-4 py-3 border-b border-slate-100">Ngày</th>
                            <th className="px-4 py-3 border-b border-slate-100">Số hiệu</th>
                            <th className="px-4 py-3 border-b border-slate-100">Loại</th>
                            <th className="px-4 py-3 border-b border-slate-100 text-right">Số lượng</th>
                            <th className="px-4 py-3 border-b border-slate-100 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {productMovements.length > 0 ? (
                            productMovements.map((m, idx) => (
                              <tr key={idx} className="hover:bg-white transition-colors group">
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    {m.date}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">{m.number}</span>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{m.description}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                                    m.isImport ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {m.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className={`text-sm font-bold ${m.isImport ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {m.isImport ? '+' : '-'}{m.quantity}
                                    </span>
                                    {m.isImport ? <ArrowUpRight size={12} className="text-emerald-400" /> : <ArrowDownRight size={12} className="text-rose-400" />}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-bold text-slate-700">{formatCurrency(m.amount)}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-10 text-center text-slate-400 italic text-sm">
                                <div className="flex flex-col items-center gap-2">
                                  <Package size={24} className="opacity-20" />
                                  Chưa có phát sinh nhập xuất kho cho vật tư này.
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {!isViewOnly && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      form="product-form"
                      disabled={isSubmitting}
                      className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                      }`}
                    >
                      {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {isSubmitting ? 'Đang lưu...' : editingProductId ? 'Cập nhật' : 'Lưu vật tư'}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 mb-8">
                Bạn có chắc chắn muốn xóa vật tư hàng hóa <span className="font-bold text-slate-900">{productToDelete?.name}</span>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    'Xác nhận xóa'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;
