import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Award, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const DoctorCard = ({ doctor, onBookClick }) => {
  const doctorName = doctor.userId?.name || doctor.name || 'Specialist';
  const deptName = doctor.departmentId?.name || 'General OPD';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between group">
      <div>
        {/* Top: Avatar & Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            {doctor.avatarUrl ? (
              <img
                src={doctor.avatarUrl}
                alt={doctorName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-cyan-600/20">
                {doctorName.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active on duty"></span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-100 mb-1">
              {deptName}
            </span>
            <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-cyan-700 transition">
              {doctorName}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate">{doctor.qualification}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                <span className="font-bold text-slate-800 ml-1">{doctor.ratingsAverage || 4.8}</span>
              </div>
              <span className="text-slate-400 text-[11px]">({doctor.ratingsQuantity || 15} reviews)</span>
            </div>
          </div>
        </div>

        {/* Details: Experience, Room, Specialization */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{doctor.bio}</p>

        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{doctor.experienceYears} Years Exp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="truncate">{doctor.roomNumber}</span>
          </div>
        </div>
      </div>

      {/* Bottom: Fee and Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Consultation Fee</span>
          <span className="text-base font-extrabold text-slate-900">{formatCurrency(doctor.consultationFee)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/doctors/${doctor._id}`}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-cyan-600 hover:bg-slate-100 rounded-xl transition"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={() => onBookClick(doctor)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm shadow-cyan-600/30 flex items-center gap-1.5 transition"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
