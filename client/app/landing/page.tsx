"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, FileText, Download, ArrowRight, CheckCircle, Users, Clock, Zap, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: <GraduationCap className="h-8 w-8 text-blue-400" />,
      title: "Moodle Integration",
      description: "Seamlessly connect with your Moodle account to access all your courses and assignments."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-400" />,
      title: "Smart Course Selection",
      description: "Choose specific courses to check for pending assignments with an intuitive interface."
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-400" />,
      title: "Document Generation",
      description: "Generate professional documents for your assignments with AI assistance."
    },
    {
      icon: <Download className="h-8 w-8 text-orange-400" />,
      title: "Bulk Downloads",
      description: "Download all generated documents at once or individually as needed."
    }
  ]

  const stats = [
    { label: "Active Users", value: "2,500+", icon: <Users className="h-5 w-5" /> },
    { label: "Assignments Processed", value: "15,000+", icon: <FileText className="h-5 w-5" /> },
    { label: "Documents Generated", value: "8,500+", icon: <Download className="h-5 w-5" /> },
    { label: "Average Time Saved", value: "4+ hrs", icon: <Clock className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Moodle Assistant
              </span>
              <p className="text-xs text-gray-400">Smart Assignment Management</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-gray-800 text-gray-200 border-gray-700">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            Trusted by thousands of students worldwide
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Streamline Your
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Moodle Workflow
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Automatically check for pending assignments, generate professional documents, 
            and manage your academic workflow with our intelligent Moodle assistant.
            <span className="block mt-2 text-gray-400">Save hours of manual work every week.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 h-14"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Managing Assignments
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-10 py-4 text-lg border-2 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-500 h-14"
            >
              Watch Demo
            </Button>
          </div>

          {/* Quick Preview */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Connect Moodle", desc: "Login with your credentials" },
                { step: "02", title: "Select Courses", desc: "Choose courses to check" },
                { step: "03", title: "Generate Docs", desc: "Download professional documents" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 text-center hover:bg-gray-800/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-3 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our comprehensive suite of tools helps you stay organized and productive throughout your academic journey.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm group">
              <CardHeader className="text-center pb-4">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">{feature.icon}</div>
                <CardTitle className="text-xl mb-2 text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-3xl mx-4 border border-gray-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Why Choose Moodle Assistant?</h2>
          <p className="text-xl text-gray-400">Designed by students, for students</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: <Zap className="h-6 w-6 text-yellow-400" />, title: "Lightning Fast", desc: "Process hundreds of assignments in seconds" },
            { icon: <Shield className="h-6 w-6 text-green-400" />, title: "Secure & Private", desc: "Your credentials are encrypted and never stored" },
            { icon: <CheckCircle className="h-6 w-6 text-blue-400" />, title: "Always Accurate", desc: "Never miss an assignment deadline again" },
            { icon: <Download className="h-6 w-6 text-purple-400" />, title: "Professional Output", desc: "Generate beautifully formatted documents" },
            { icon: <Clock className="h-6 w-6 text-orange-400" />, title: "Save Time", desc: "Reduce manual work by up to 90%" },
            { icon: <Users className="h-6 w-6 text-pink-400" />, title: "Student Focused", desc: "Built specifically for academic workflows" }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-700 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-2xl backdrop-blur-sm">
          <CardContent className="py-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Your Workflow?</h2>
            <p className="text-xl mb-8 text-gray-300">
              Join thousands of students who are already saving hours every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-10 py-4 text-lg border-2 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-500"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Moodle Assistant
              </span>
            </div>
            <p className="text-gray-500 mb-4">Making academic life easier, one assignment at a time.</p>
            <p className="text-gray-600 text-sm">&copy; 2025 Moodle Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
