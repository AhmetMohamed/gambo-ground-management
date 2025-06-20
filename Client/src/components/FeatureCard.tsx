
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  link?: string;
}

const FeatureCard = ({ title, description, icon, link }: FeatureCardProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-gambo-light hover:translate-y-[-5px] group">
      <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-gambo-muted text-gambo group-hover:bg-gambo group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-gambo transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
      {link && (
        <a href={link} className="inline-flex items-center text-gambo font-medium hover:text-gambo-dark">
          Learn more
          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default FeatureCard;
