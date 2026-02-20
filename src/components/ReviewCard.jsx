import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

/**
 * ReviewCard component
 * Props: review { author, initials, date, rating, comment, helpful }
 */
export default function ReviewCard({ review }) {
    return (
        <div className="border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition bg-white">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm flex-shrink-0">
                        {review.initials}
                    </div>
                    <div>
                        <div className="font-bold text-stone-900 text-sm">{review.author}</div>
                        <div className="text-xs text-stone-400">{review.date}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-900 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> {review.rating.toFixed(1)}
                </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed mb-3">{review.comment}</p>

            <button className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition group">
                <ThumbsUp className="w-3.5 h-3.5 group-hover:text-emerald-700 transition" />
                Helpful ({review.helpful})
            </button>
        </div>
    );
}
