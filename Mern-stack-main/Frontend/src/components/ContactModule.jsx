import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Users, Shield } from 'lucide-react';

const ContactModule = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      description: 'Round-the-clock assistance for urgent queries',
      details: '+92 3051180621',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Detailed responses within business hours',
      details: '23021519-080@uog.edu.pk',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant help during business hours',
      details: 'Available 9 AM - 6 PM EST',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Team Support',
      description: 'Dedicated account managers for institutions',
      details: 'Enterprise clients only',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Technical Support',
      description: 'Technical issues and bug reports',
      details: 'hariskhan@gmail.com',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Clock,
      title: 'Response Time',
      description: 'We value your time and respond quickly',
      details: 'Typically < 2 hours',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-slate-950 via-pink to-indigo-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="container mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Multiple Support
            <span className="block text-gradient mt-2">Channels Available</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're here to help you with any questions about our QR Attendance System. 
            Choose your preferred way to reach out to our support team.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {contactInfo.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              className="glass-effect rounded-2xl p-6 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <span className="text-white font-semibold text-lg">{item.details}</span>
              </div>
              
              {/* Hover effect line */}
              <div className="w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full mt-3"></div>
            </motion.div>
          ))}
        </div>

        {/* Side-by-Side Contact Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-gradient">Get Instant Support</h3>
              <p className="text-gray-300 mb-6 text-lg">
                Our dedicated support team is ready to assist you with any questions about 
                the QR Attendance System. Whether you're an admin setting up your institution, 
                a teacher managing classes, or a student using the system, we're here to help.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Global Support</h4>
                    <p className="text-gray-400">Available worldwide for educational institutions</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Quick Response</h4>
                    <p className="text-gray-400">Average response time under 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="relative">
              <div className="glass-effect rounded-2xl p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-16 h-16 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Ready to Help</h4>
                <p className="text-gray-300 mb-6">
                  Our support team consists of experienced professionals who understand 
                  the unique challenges of educational technology.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm font-medium">Online Now</span>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-blue-500/30 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-purple-500/30 animate-pulse delay-1000"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactModule;