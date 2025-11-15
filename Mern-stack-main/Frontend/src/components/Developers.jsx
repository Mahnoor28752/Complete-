import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const developers = [
  {
    name: "Mahnoor",
    role: "Full Stack Developer",
    gradient: "from-pink-500 to-rose-500",
    image:
      "A professional portrait of a female software developer named Mahnoor, smiling confidently.",
  },
  {
    name: "Muhammad Haris Khan",
    role: "Full Stack Developer",
    gradient: "from-blue-500 to-cyan-500",
    image:
      "A professional portrait of a male software developer named Muhammad Haris Khan, looking at the camera.",
  },
];

const Developers = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Meet the Team</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built by
            <span className="text-gradient ml-3">Passionate Developers</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Two talented developers working together to revolutionize attendance
            tracking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="glass-effect rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-32 h-32 mx-auto rounded-full mb-6 shadow-lg overflow-hidden border-4 border-white/10">
              <img
                className="w-full h-full object-cover"
                alt="Portrait of Mahnoor"
                src="/public/Me.jpg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Mahnoor</h3>
            <p className="text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent font-semibold">
              Full Stack Developer
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="glass-effect rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-32 h-32 mx-auto rounded-full mb-6 shadow-lg overflow-hidden border-4 border-white/10">
              <img
                className="w-full h-full object-cover scale-150"
                alt="Portrait of Muhammad Haris Khan"
                src="/public/haris.jpg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Muhammad Haris Khan</h3>
            <p className="text-lg bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
              Full Stack Developer
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
