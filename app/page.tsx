import Link from "next/link";
import { Pill, Shield, Clock, Truck, Star, Phone, Mail, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Your Trusted <span className="text-blue-600 dark:text-blue-400">Pharmacy</span> Partner
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Get your medicines delivered safely and quickly. Licensed pharmacists, 
              genuine medicines, and 24/7 support for your health needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/shop/catalog" 
                className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Order Medicine Online
              </Link>
              <Link 
                href="/contact" 
                className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              >
                Contact Pharmacist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive pharmacy services designed to meet all your healthcare needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Prescription Medicines</h3>
              <p className="text-gray-600 dark:text-gray-300">Licensed dispensing of prescription medications with proper verification</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Health Consultation</h3>
              <p className="text-gray-600 dark:text-gray-300">Expert advice from qualified pharmacists for your health concerns</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Home Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Fast and secure delivery of medicines to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-300">Simple steps to get your medicines delivered</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 dark:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Browse & Search</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Find medicines by name, category, or health condition</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 dark:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Upload Prescription</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Upload prescription for prescription medicines</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 dark:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Secure Payment</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Pay securely using multiple payment options</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 dark:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get medicines delivered within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-300">Popular medicines and health products</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Paracetamol 500mg", price: "$5.99", category: "Pain Relief" },
              { name: "Vitamin D3", price: "$12.99", category: "Supplements" },
              { name: "Cough Syrup", price: "$8.99", category: "Cold & Flu" },
              { name: "First Aid Kit", price: "$24.99", category: "Healthcare" }
            ].map((product, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-gray-100 dark:bg-gray-700 h-32 rounded mb-4"></div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{product.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop/catalog" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Trust Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Licensed & Certified</h3>
              <p className="text-gray-600 dark:text-gray-300">Fully licensed pharmacy with certified pharmacists</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Quality Assured</h3>
              <p className="text-gray-600 dark:text-gray-300">100% genuine medicines from authorized distributors</p>
            </div>
            <div className="text-center">
              <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Round-the-clock customer support and consultation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediCare Pharmacy</h3>
              <p className="text-gray-400 mb-4">Your trusted healthcare partner providing quality medicines and professional pharmaceutical services.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop/catalog" className="hover:text-white">Shop Medicines</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Prescription Medicines</li>
                <li>Health Consultation</li>
                <li>Home Delivery</li>
                <li>Health Checkups</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@medicare.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Health St, Medical City</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare Pharmacy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
