import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Plus, Loader2, ChevronLeft, ChevronRight, CheckCircle, Clock, Play, Calendar, Layout, Pencil, X, Check } from 'lucide-react';

const Home = () => {
  // States
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });

  const API_URL = `${import.meta.env.VITE_API_URL}`;
  const LIMIT = 5;

  // 1. Fetch Todos
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/todos/get?page=${page}&limit=${LIMIT}`);
      setTodos(data.todos || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [page, API_URL]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 2. Create Todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required!");
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/todos/create`, formData);
      toast.success("Task added!");
      setFormData({ title: '', description: '' });
      fetchTodos();
    } catch (err) {
      toast.error("Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Update Status (Optimistic UI)
  const handleStatusChange = async (id, newStatus) => {
    const originalTodos = [...todos];
    setTodos(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));

    try {
      await axios.put(`${API_URL}/todos/update/${id}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      setTodos(originalTodos); 
      toast.error("Update failed");
    }
  };

  // 4. Update Title and Description
  const handleEditSave = async (id) => {
    if (!editFormData.title.trim()) return toast.error("Title is required!");
    try {
      await axios.put(`${API_URL}/todos/update/${id}`, editFormData);
      toast.success("Task updated!");
      setEditingId(null);
      fetchTodos();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  // 5. Delete Todo
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/delete/${id}`);
      toast.success("Task deleted");
      fetchTodos();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'In-Progress') return <Play className="w-5 h-5 text-blue-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-[#efefef] font-sans text-slate-900 pb-20 antialiased">
      <Toaster position="top-right" />
      
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-slate-800" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
              MERN Todo App
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        {/* Form Section */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-10 transition-all hover:shadow-slate-200/70">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text"
              placeholder="Task Title..."
              className="w-full text-xl font-semibold outline-none border-none placeholder:text-slate-400"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              placeholder="Add details and descriptions..."
              className="w-full text-slate-500 outline-none resize-none text-md border-none"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <div className="flex justify-end pt-2">
              <button 
                disabled={submitting}
                className="bg-slate-900 hover:bg-black cursor-pointer text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg hover:shadow-slate-300 disabled:opacity-50 font-medium active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create Task
              </button>
            </div>
          </form>
        </section>

        {/* List Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-medium tracking-widest uppercase text-xs"> Loading Tasks</p>
            </div>
          ) : todos.length > 0 ? (
            todos.map((todo, index) => (
              <div key={todo._id} className="group bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-5 flex-1">
                  <span className="text-xs font-bold text-gray-600 mt-1.5 w-5">
                    {String((page - 1) * LIMIT + index + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="flex-1">
                    {editingId === todo._id ? (
                      <div className="space-y-2 pr-4">
                        <input 
                          type="text"
                          className="w-full text-lg font-bold text-slate-800 border-b-2 border-slate-200 focus:border-slate-900 outline-none transition-all"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                          autoFocus
                        />
                        <textarea 
                          className="w-full text-sm text-gray-600 border-b-2 border-slate-100 focus:border-slate-900 outline-none resize-none transition-all"
                          rows="1"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-1">
                          {getStatusIcon(todo.status)}
                          <h3 className={`text-lg font-bold ${todo.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {todo.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-900 ml-8 mb-2 leading-relaxed">{todo.description}</p>
                        
                        <div className="flex items-center gap-1.5 ml-8 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                          <Calendar className="w-3 h-3" />
                          {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {editingId === todo._id ? (
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleEditSave(todo._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-xl cursor-pointer transition-all"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <select 
                        value={todo.status}
                        onChange={(e) => handleStatusChange(todo._id, e.target.value)}
                        className="text-xs font-bold bg-slate-50 border-none rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-slate-100 transition focus:ring-2 focus:ring-slate-100"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      
                      <button 
                        onClick={() => {
                          setEditingId(todo._id);
                          setEditFormData({ title: todo.title, description: todo.description });
                        }}
                        className="p-2 text-gray-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => handleDelete(todo._id)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-300">
              <p className="font-bold tracking-widest uppercase text-xs">No tasks added</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-12">
            <div className="flex items-center gap-6">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 cursor-pointer transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {page}
                </span>
                <span className="text-xs font-black text-slate-400 tracking-widest px-1">of</span>
                <span className="text-sm font-bold text-slate-600">{totalPages}</span>
              </div>

              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 cursor-pointer transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${page === i + 1 ? 'w-6 bg-slate-900' : 'w-2 bg-slate-200'}`} 
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;