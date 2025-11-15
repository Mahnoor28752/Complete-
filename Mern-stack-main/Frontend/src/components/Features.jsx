import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, QrCode, BarChart3, Clock, Lock } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Admin Portal',
    description: 'Complete control over student management, course assignments, and comprehensive attendance reports.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'Teacher Portal',
    description: 'Generate time-limited QR codes, manage class sessions, and download detailed attendance reports.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: QrCode,
    title: 'Student Portal',
    description: 'Quick QR code scanning, real-time attendance tracking, and instant class status updates.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Lock,
    title: 'Proxy Prevention',
    description: 'Secure authentication system that ties attendance to unique user credentials and devices.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Clock,
    title: 'Time-Limited QR',
    description: 'Configurable expiration times for QR codes ensure attendance is marked within class hours.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: BarChart3,
    title: 'Advanced Reports',
    description: 'Daily and monthly attendance reports in PDF format with detailed analytics and insights.',
    gradient: 'from-pink-500 to-rose-500'
  }
];

const Features = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="container mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for
            <span className="block text-gradient mt-2">Every User Role</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A comprehensive solution designed to meet the unique needs of administrators, teachers, and students.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              className="glass-effect rounded-2xl p-8 transition-all duration-300 group"
            >
              <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;