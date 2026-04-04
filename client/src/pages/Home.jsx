import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Map,
  Clock,
  Users,
  Award,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Building2,
  Smartphone,
  Globe,
  ChevronRight,
  Star,
  Bell,
  Phone,
  Mail,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import IssueCard from "../components/IssueCard";

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

const Home = () => {
  const { stats, issues } = useApp();
  const recentIssues = issues.slice(0, 3);

  const features = [
    {
      icon: Map,
      title: "Real-time Tracking",
      description:
        "Track issues in real-time with our interactive map and get live updates on progress.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      delay: 0,
    },
    {
      icon: Clock,
      title: "Fast Response",
      description:
        "Average response time under 24 hours. Our team works around the clock to address your concerns.",
      color: "text-green-500",
      bgColor: "bg-green-50",
      delay: 0.1,
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Join thousands of active citizens making a difference. Your voice matters in shaping our city.",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      delay: 0.2,
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is protected with enterprise-grade security. We prioritize your privacy.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      delay: 0.3,
    },
    {
      icon: Award,
      title: "Verified Solutions",
      description:
        "Every resolution is verified by our team to ensure quality and effectiveness.",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      delay: 0.4,
    },
    {
      icon: TrendingUp,
      title: "Impact Tracking",
      description:
        "See the real impact of your reports with detailed analytics and community metrics.",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      delay: 0.5,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Community Leader",
      content:
        "This platform has transformed how we handle neighborhood issues. Response times have never been faster!",
      avatar: "SJ",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Local Business Owner",
      content:
        "Being able to track issues in real-time gives me peace of mind. The transparency is unmatched.",
      avatar: "MC",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "City Council Member",
      content:
        "A game-changer for civic engagement. We've seen a 40% increase in community participation.",
      avatar: "ER",
      rating: 5,
    },
  ];

  const statsData = [
    {
      label: "Total Issues Reported",
      value: stats.total,
      icon: AlertCircle,
      trend: "+12%",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Issues Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      trend: "+8%",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Active Workers",
      value: stats.workers,
      icon: Users,
      trend: "+23%",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Satisfaction Rate",
      value: "98%",
      icon: Star,
      trend: "+2%",
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section - Enhanced with gradient animation */}
      <section className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 rounded-full -left-4 w-72 h-72 bg-primary-200 mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 bg-purple-200 rounded-full -right-4 w-72 h-72 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bg-blue-200 rounded-full -bottom-8 left-20 w-72 h-72 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="flex flex-col justify-center pl-8 lg:pl-12">
            {/* Heading */}
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-5xl">
              Fixing Local Problems
              <br />
              <span className="text-transparent bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text">
                with Smart Technology
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl mb-10 text-lg text-gray-600 md:text-xl lg:text-lg">
              Report issues in your community, track progress in real-time, and
              contribute to making your city better.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/report"
                className="inline-flex items-center justify-center px-8 py-4 space-x-2 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:shadow-xl hover:scale-105"
              >
                <span>Report Issue</span>
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/map"
                className="inline-flex items-center justify-center px-8 py-4 space-x-2 text-lg font-semibold transition-all duration-300 bg-white border-2 border-primary-200 rounded-xl text-primary-700 hover:shadow-lg hover:scale-105"
              >
                <Map size={20} />
                <span>View Map</span>
              </Link>
            </div>
          </div>

          {/* Images Section */}
          <div className="relative flex items-center justify-center">
            {/* Main Pothole Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&crop=center"
                alt="Pothole on road - Major civic issue"
                className="w-full max-w-md h-80 object-cover rounded-2xl shadow-2xl"
              />

              {/* Overlay Images */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=200&fit=crop"
                  alt="Garbage accumulation"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute top-1/2 -right-8 w-16 h-16 rounded-full overflow-hidden shadow-lg border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop"
                  alt="Water leakage"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute top-8 -right-4 w-18 h-18 rounded-lg overflow-hidden shadow-lg border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center"
                  alt="Road damage"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section - Enhanced with animated counters */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {statsData.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative p-6 overflow-hidden text-center transition-all duration-300 shadow-md rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl group"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`}
                ></div>
                <div
                  className={`inline-flex p-3 mb-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <stat.icon className="text-white" size={28} />
                </div>
                <motion.div
                  className="text-4xl font-bold text-gray-900"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <div className="mt-1 text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
                <div className="mt-2 text-xs font-semibold text-green-600">
                  {stat.trend} this month
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Enhanced with 6 features and better cards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Why Choose Samadhaan?
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Smart solutions powered by cutting-edge technology for smarter
              communities
            </p>
          </motion.div>
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative p-8 transition-all duration-300 bg-white border border-gray-100 shadow-lg group rounded-2xl hover:shadow-2xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                ></div>
                <div className="relative">
                  <div
                    className={`inline-flex p-3 mb-4 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={feature.color} size={32} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Issues - Enhanced with better grid */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col items-center justify-between mb-12 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Recent Issues
              </h2>
              <p className="mt-2 text-gray-600">
                Latest reports from your community
              </p>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center mt-4 font-semibold text-primary-600 hover:text-primary-700 sm:mt-0 group"
            >
              View All Issues
              <ChevronRight
                size={18}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {recentIssues.map((issue, idx) => (
              <motion.div key={issue.id} variants={itemVariants}>
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - New section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied citizens making a difference
            </p>
          </motion.div>
          <motion.div
            className="grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-8 transition-shadow duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-white rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-current text-amber-400"
                    />
                  ))}
                </div>
                <p className="leading-relaxed text-gray-600">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced with glass morphism effect */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-96 h-96 opacity-10 filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white rounded-full w-96 h-96 opacity-10 filter blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Ready to Make a Difference?
            </h2>
            <p className="mb-8 text-xl text-primary-100">
              Join thousands of citizens already improving their communities.
              Every report counts.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/report"
                className="inline-flex items-center px-10 py-4 text-lg font-semibold transition-all duration-300 transform bg-white shadow-xl text-primary-600 rounded-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Report an Issue Now
                <ArrowRight
                  size={20}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section - Enhanced */}
      <footer className="text-gray-300 bg-gray-900">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">Samadhaan</h3>
              <p className="text-sm leading-relaxed">
                Making communities better, one issue at a time.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/report"
                    className="transition-colors hover:text-white"
                  >
                    Report Issue
                  </Link>
                </li>
                <li>
                  <Link
                    to="/map"
                    className="transition-colors hover:text-white"
                  >
                    View Map
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="transition-colors hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail size={14} />
                  <span>support@samadhaan.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone size={14} />
                  <span>+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="transition-colors hover:text-white">
                  <Twitter size={20} />
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  <Github size={20} />
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center border-t border-gray-800">
            <p>
              &copy; {new Date().getFullYear()} Samadhaan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Add this to your global CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
