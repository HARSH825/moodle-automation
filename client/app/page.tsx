"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Triangle, BookOpen, FileText, Download, Users, Clock, Zap, Shield, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Triangle className="h-8 w-8 text-blue-400" />,
      title: "Moodle Integration",
      description: "Seamlessly connect to your Moodle account to access courses, assignments, and even related faculty-uploaded files."
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r text-white rounded-lg">
              <Triangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
                Moodle automation
              </span>
              <p className="text-xs text-gray-400">Smart Assignment Management</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Streamline Your
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Moodle Workflow
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Automatically check for pending assignments, generate professional documents, 
            and manage your academic workflow with intelligent automation flow.
            <span className="block mt-2 text-gray-400">Save hours of manual work every week.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => router.push('/login')}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 h-14"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button> 
            <Button 
              size="lg" 
              variant="outline" 
              className="cursor-pointer px-10 py-4 text-lg border-2 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-500 h-14"
            >
              Watch Demo
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="cursor-pointer px-10 py-4 text-lg border-2 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-500 h-14"
            >
              Architecture and Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">How it works?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            These tools automate your workflow, helping you stay organized and productive throughout your academic journey.
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
          <h2 className="text-4xl font-bold mb-4 text-white">Why Choose Moodle automation?</h2>
          <p className="text-xl text-gray-400">Designed by a student, for students</p>
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
              Join students already saving hours weekly—instead focus on what truly matters 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/login')}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="cursor-pointer px-10 py-4 text-lg border-2 border-gray-600 text-gray-200 bg-gray-800 hover:text-white hover:border-gray-500 hover:bg-gray-800"
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
              <div className="p-2 bg-gradient-to-r text-white rounded-lg">
                <Triangle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
                Moodle automation
              </span>
            </div>
            <p className="text-gray-500 mb-4">Making academic life easier, saving hours of manual work.</p>
  

            {/* GitHub Icon */}
            <a
              href="https://github.com/HARSH825"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center mt-4 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-6 h-6 text-gray-500 hover:text-white transition-colors"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
                -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 
                0 0 .67-.21 2.2.82a7.66 7.66 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 
                2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 
                2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 
                0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0016 
                8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
