import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateUser from './CreateUser';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Package, Clock, Calendar, Phone, UserCheck, 
  UserX, Search, Filter, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import "../styles/AdminDashboard.css";


function AdminDashboard() {
  const [tab, setTab] = useState('create');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');

  // Color palette: 60% white, 30% red, 10% accent (gold)
  const colors = {
    primary: '#DC2626', // Red (30%)
    primaryLight: '#FEE2E2',
    background: '#FFFFFF', // White (60%)
    surface: '#F8FAFC',
    text: '#1F2937',
    textLight: '#6B7280',
    accent: '#D97706', // Gold (10%)
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.id?.toString().includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole;
    const matchesPackage = filterPackage === 'all' || user.package === filterPackage;
    
    return matchesSearch && matchesRole && matchesPackage;
  });

  // Get unique packages for filter
  const uniquePackages = [...new Set(users.map(u => u.package).filter(Boolean))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-10 shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-red-100 text-sm">Manage users and subscriptions</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUsers}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: colors.primary }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textLight }}>Total Users</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>{users.length}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: colors.primaryLight }}>
                  <Users className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: colors.accent }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textLight }}>Active Users</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>
                    {users.filter(u => u.active === 'Yes').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: colors.success }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textLight }}>Active Packages</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>
                    {users.filter(u => u.package !== 'N/A').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: colors.warning }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textLight }}>Expiring Soon</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>
                    {users.filter(u => {
                      if (!u.expireAt) return false;
                      const expireDate = new Date(u.expireAt);
                      const today = new Date();
                      const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
                      return diffDays <= 7 && diffDays > 0;
                    }).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 p-1 bg-white rounded-xl shadow-lg max-w-md">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab('create')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all ${
                tab === 'create' 
                  ? 'shadow-md text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={tab === 'create' ? { backgroundColor: colors.primary } : {}}
            >
              <UserPlus className="w-5 h-5" />
              <span>Create User</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab('users')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-all ${
                tab === 'users' 
                  ? 'shadow-md text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={tab === 'users' ? { backgroundColor: colors.primary } : {}}
            >
              <Users className="w-5 h-5" />
              <span>All Users</span>
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {tab === 'create' ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <CreateUser />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                        style={{ borderColor: colors.primaryLight, focusRingColor: colors.primary }}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                        style={{ borderColor: colors.primaryLight, focusRingColor: colors.primary }}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="cashier">Cashier</option>
                        <option value="user">User</option>
                      </select>
                      
                      <select
                        value={filterPackage}
                        onChange={(e) => setFilterPackage(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                        style={{ borderColor: colors.primaryLight, focusRingColor: colors.primary }}
                      >
                        <option value="all">All Packages</option>
                        {uniquePackages.map(pkg => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSearchTerm('');
                          setFilterRole('all');
                          setFilterPackage('all');
                        }}
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                      >
                        <Filter className="w-4 h-4 inline mr-2" />
                        Clear Filters
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr style={{ backgroundColor: colors.primaryLight }}>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>User</th>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>Package</th>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>Scans</th>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>Status</th>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>Expiry</th>
                              <th className="py-4 px-6 text-left font-semibold" style={{ color: colors.text }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="py-12 text-center">
                                  <div className="flex flex-col items-center">
                                    <Users className="w-16 h-16 mb-4" style={{ color: colors.primaryLight }} />
                                    <p className="text-lg font-medium mb-2" style={{ color: colors.text }}>No users found</p>
                                    <p style={{ color: colors.textLight }}>Try adjusting your search or filters</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user, index) => (
                                <motion.tr
                                  key={user.id}
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  transition={{ delay: index * 0.05 }}
                                  className="border-b hover:bg-gray-50 transition-colors"
                                >
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                                           style={{ backgroundColor: colors.primary + '20' }}>
                                        <span className="font-bold" style={{ color: colors.primary }}>
                                          {user.name?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium" style={{ color: colors.text }}>{user.name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <Phone className="w-3 h-3" style={{ color: colors.textLight }} />
                                          <span className="text-sm" style={{ color: colors.textLight }}>{user.phone}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <Package className="w-4 h-4 mr-2" style={{ color: colors.accent }} />
                                      <span className="font-medium">{user.package || 'No Package'}</span>
                                    </div>
                                    <div className="text-sm mt-1" style={{ color: colors.textLight }}>
                                      ID: {user.id}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="relative pt-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <div>
                                          <span className="font-bold text-lg" style={{ color: colors.text }}>
                                            {user.remainingScans}
                                          </span>
                                          <span className="text-sm ml-1" style={{ color: colors.textLight }}>
                                            / {user.package === '1 Month' ? '13' : user.package === '3 Months' ? '9999' : '∞'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                                        <div 
                                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-500"
                                          style={{ 
                                            width: `${Math.min(100, (user.remainingScans === 'Unlimited' ? 100 : 
                                              (user.remainingScans / (user.package === '1 Month' ? 13 : 100)) * 100))}%`,
                                            backgroundColor: user.remainingScans === 'Unlimited' ? colors.success : 
                                              user.remainingScans > 5 ? colors.success :
                                              user.remainingScans > 0 ? colors.warning : colors.danger
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex flex-col space-y-1">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        user.active === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                      }`}>
                                        {user.active === 'Yes' ? (
                                          <>
                                            <UserCheck className="w-3 h-3 mr-1" />
                                            Active
                                          </>
                                        ) : (
                                          <>
                                            <UserX className="w-3 h-3 mr-1" />
                                            Inactive
                                          </>
                                        )}
                                      </span>
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                                        user.role === 'cashier' ? 'bg-blue-50 text-blue-700' :
                                        'bg-gray-50 text-gray-700'
                                      }`}>
                                        {user.role}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2" style={{ color: colors.textLight }} />
                                      <div>
                                        <p style={{ color: colors.text }}>
                                          {user.expireAt ? new Date(user.expireAt).toLocaleDateString() : 'Never'}
                                        </p>
                                        {user.expireAt && (
                                          <p className="text-sm" style={{ color: colors.textLight }}>
                                            {(() => {
                                              const expireDate = new Date(user.expireAt);
                                              const today = new Date();
                                              const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
                                              return diffDays > 0 ? `${diffDays} days left` : 'Expired';
                                            })()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <motion.button
                                      whileHover={{ scale: 1.05, x: 5 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex items-center text-sm font-medium"
                                      style={{ color: colors.primary }}
                                    >
                                      View Details
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </motion.button>
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Footer */}
                      {filteredUsers.length > 0 && (
                        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: colors.primaryLight }}>
                          <div className="text-sm" style={{ color: colors.textLight }}>
                            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                          >
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                          </motion.button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={fetchUsers}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <RefreshCw className="w-6 h-6 text-white" />
      </motion.button>
    </motion.div>
  );
}

export default AdminDashboard;