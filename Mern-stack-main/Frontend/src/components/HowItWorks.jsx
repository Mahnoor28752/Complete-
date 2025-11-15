import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, QrCode, ScanLine, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Admin Setup',
    description: 'Admin creates student accounts and assigns courses to teachers with scheduled class times.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: QrCode,
    title: 'QR Generation',
    description: 'Teacher generates a unique, time-limited QR code for each class session.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ScanLine,
    title: 'Student Scan',
    description: 'Students scan the QR code using their authenticated portal to mark attendance.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: CheckCircle,
    title: 'Verified Attendance',
    description: 'System logs attendance with unique user credentials, preventing proxy check-ins.',
    color: 'from-green-500 to-emerald-500'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It
            <span className="text-gradient ml-3">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A simple four-step process that ensures secure and accurate attendance tracking.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          <div className="hidden md:block absolute left-10 top-10 w-0.5 h-full bg-gradient-to-b from-white/20 to-transparent -z-10"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-12 last:mb-0"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <div className="flex-1 glass-effect rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-5xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-gray-300 text-lg">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;