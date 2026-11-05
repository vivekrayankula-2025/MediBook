import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../api/doctorApi';
import { departmentApi } from '../api/departmentApi';
import DoctorCard from '../components/doctor/DoctorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Filter, Stethoscope, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentSearch = searchParams.get('search') || '';
  const currentDept = searchParams.get('department') || '';
  const currentSort = searchParams.get('sort') || 'rating';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    departmentApi.getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await doctorApi.getDoctors({
          search: currentSearch,
          department: currentDept,
          sort: currentSort,
        });
        setDoctors(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [currentSearch, currentDept, currentSort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleDeptChange = (deptId) => {
    const params = new URLSearchParams(searchParams);
    if (deptId) {
      params.set('department', deptId);
    } else {
      params.delete('department');
    }
    setSearchParams(params);
  };

  const handleSortChange = (sortVal) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortVal);
    setSearchParams(params);
  };

  const handleBookClick = (doctor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/doctors/${doctor._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
          Physician Directory
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find & Book Specialist Doctors
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search qualified medical consultants across all clinical departments. Select a doctor to view their real-time available schedule and reserve a consultation slot.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by doctor name or specialization..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </form>

          {/* Department Dropdown */}
          <div className="w-full md:w-64">
            <select
              value={currentDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Clinical Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="fee_low">Consultation Fee: Low to High</option>
              <option value="fee_high">Consultation Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
        </div>

        {/* Quick Department Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Quick Filter:
          </span>
          <button
            type="button"
            onClick={() => handleDeptChange('')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
              !currentDept
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {departments.map((dept) => (
            <button
              key={dept._id}
              type="button"
              onClick={() => handleDeptChange(dept._id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                currentDept === dept._id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving verified medical specialists..." />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No doctors matched your filter criteria. Try clearing search keywords or choosing another department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} onBookClick={handleBookClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
