"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Award,
  Shield,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image";

export default function PickleballCourtCertification() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isVisible, setIsVisible] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const certificationCriteria = [
    {
      title: "Court Dimensions and Layout",
      icon: MapPin,
      items: [
        {
          requirement: "Court Size",
          specification: "6.10 m x 13.41 m (20 ft x 44 ft)",
        },
        {
          requirement: "Total Playing Area (including run-off)",
          specification: "Minimum 9.14 m x 18.29 m (30 ft x 60 ft)\nRecommended 10.36 m x 19.5 m (34 ft x 64 ft)",
        },
        {
          requirement: "Orientation",
          specification: "North-South preferred to reduce Sun glare",
        },
        {
          requirement: "Court Surface Level",
          specification: "Flat, even, with proper drainage",
        },
      ],
    },
    {
      title: "Line Markings",
      icon: Award,
      items: [
        {
          requirement: "Baseline",
          specification: "5.08 cm (2 in) wide, solid",
        },
        {
          requirement: "Sideline",
          specification: "5.08 cm (2 in) wide, solid",
        },
        {
          requirement: "Non-Volley Zone Line (Kitchen)",
          specification: "2.13 m (7 ft) from net, 5.08 cm (2 in) wide",
        },
        {
          requirement: "Centre line",
          specification: "Divides service areas, 5.08 cm (2 in) wide",
        },
        {
          requirement: "Line Color",
          specification: "Contrast clearly with surface; usually white or yellow",
        },
      ],
    },
    {
      title: "Net System",
      icon: Shield,
      items: [
        {
          requirement: "Net Height (Centre)",
          specification: "86.36 cm (34 inches)",
        },
        {
          requirement: "Net Height (Sidelines)",
          specification: "91.44 cm (36 inches)",
        },
        {
          requirement: "Net Material",
          specification: "Durable, preferably weather-resistant",
        },
        {
          requirement: "Centre Strap",
          specification: "Adjusts net height at centre",
        },
      ],
    },
    {
      title: "Court Surface",
      icon: CheckCircle,
      items: [
        {
          requirement: "Surface Type",
          specification: "Asphalt or concrete with acrylic surface coating",
        },
        {
          requirement: "Bounce Consistency",
          specification: "Uniform Pickleball bounce across entire court",
        },
        {
          requirement: "Traction & Texture",
          specification: "Non-slip, safe for lateral movement",
        },
      ],
    },
    {
      title: "Lighting (for Indoor / Outdoor Night Play)",
      icon: Star,
      items: [
        {
          requirement: "Illumination Level",
          specification: "Minimum 50 foot-candles uniformly across court",
        },
        {
          requirement: "Light Pole Height",
          specification: "Typically, 20–30 ft",
        },
        {
          requirement: "Glare Control",
          specification: "Shields or angles to prevent direct eye glare",
        },
      ],
    },
    {
      title: "Fencing / Enclosures",
      icon: Shield,
      items: [
        {
          requirement: "Fence Height",
          specification: "10–12 ft recommended",
        },
        {
          requirement: "Material",
          specification: "Chain-link or mesh",
        },
        {
          requirement: "Distance Between Courts",
          specification: "Minimum 8 ft",
        },
      ],
    },
    {
      title: "Access and Safety",
      icon: Users,
      items: [
        {
          requirement: "Accessibility",
          specification: "Ramps, pathways for wheelchair access (if applicable)",
        },
        {
          requirement: "Emergency Access",
          specification: "Clearly marked exits",
        },
        {
          requirement: "First Aid Station",
          specification: "Nearby On-site or within 50 meters",
        },
      ],
    },
    {
      title: "Maintenance and Upkeep",
      icon: Clock,
      items: [
        {
          requirement: "Surface Cleaning",
          specification: "Regular schedule for cleaning debris and checking cracks",
        },
        {
          requirement: "Net & Posts Maintenance",
          specification: "Periodic inspection and replacement",
        },
      ],
    },
    {
      title: "Supporting Documents",
      icon: FileText,
      items: [
        {
          requirement: "Court Design Drawing",
          specification: "Scaled plan with dimensions and features",
        },
        {
          requirement: "Photos of Completed Court",
          specification: "Overhead + multiple angles (minimum 4)",
        },
        {
          requirement: "Compliance Declaration",
          specification: "Signed by facility owner/manager",
        },
      ],
    },
  ]

  const certificationProcess = [
    {
      step: 1,
      title: "Application",
      description:
        "Submit your online application at https://brainwavesportstech.com/ and complete your application by uploading required information and documents with payment fee.",
      icon: FileText,
      duration: "1-2 days",
    },
    {
      step: 2,
      title: "Facility Inspection",
      description:
        "A representative from AIPA / Brainwave SportsTech will visit the facility for inspection and evaluation. The date of visit will be mutually decided between the facility owner and the certification team.",
      icon: CheckCircle,
      duration: "1 day",
    },
    {
      step: 3,
      title: "Approval and Certification",
      description:
        "After ensuring that the facility meets the required standards, AIPA will approve it and issue a certification. The facility will be awarded court certification.",
      icon: Award,
      duration: "3-5 days",
    },
    {
      step: 4,
      title: "Ongoing Compliance",
      description:
        "Once certified, the facility must be maintained to ensure that facilities and courts remain up to standards.",
      icon: AlertCircle,
      duration: "Ongoing",
    },
  ]

  const benefits = [
    {
      title: "Official Recognition",
      description:
        'Certification provides official recognition from AIPA lending credibility to the facility. The facility owner will be allowed to display boards "AIPA Certified Court" with AIPA logo.',
      icon: Award,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Enhanced Visibility",
      description:
        "AIPA certified courts and facilities will be listed on AIPA and Brainwave SportsTech websites for better visibility assurance to the pickleball community.",
      icon: TrendingUp,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Commercial Benefits",
      description:
        "Certified facilities endorsed by AIPA are more likely to be chosen to host official tournaments, leagues, and events. Certification can be used for marketing and promotion activity by the facility owner.",
      icon: Users,
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Quality Assurance",
      description:
        "Certification ensures the players that the facility meets industry standards for safety, quality, and player experience.",
      icon: Shield,
      color: "bg-orange-50 border-orange-200",
    },
  ]

  const fees = [
    {
      type: "Initial Certification (up to two courts)",
      price: 25000,
      notes: "Plus applicable GST",
      popular: true,
    },
    {
      type: "Additional Court (same facility)",
      price: 10000,
      notes: "Per court, plus applicable GST",
      popular: false,
    }
  ]

  const additionalTerms = [
    "Facility owner will bear the cost of to and fro Air ticket (to the nearest airport) or Railway AC First Class fare, if there is no airport available.",
    "Facility owner will bear the cost of accommodation and food for the AIPA/Brainwave SportsTech representative visiting the facility for inspection in a standard hotel.",
    "Facility owner will provide one assistant during actual on-field measurement and testing.",
    "Certification will be valid for Three Years from the date of certification after which review of court surfaces will be mandatory to ensure that they meet certification standards.",
  ]

  const renderIcon = (IconComponent, className = "h-6 w-6") => {
    return <IconComponent className={className} />
  }

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(to bottom right, rgba(44, 62, 80, 0.45), rgba(30, 41, 59, 0.45)), url('/images/home/D.webp')` }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl" />

        {/* Abstract background lines */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
            <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
            <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#f39c12]/10 border border-[#f39c12]/20 text-[#f39c12] px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Award className="h-4 w-4" />
              Official AIPA Certification Program
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Elevate Your <span className="text-[#f39c12]">Pickleball Court</span>
              <br />
              to Professional Standards
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your facility into a professionally certified venue that meets the highest standards of quality,
              safety, and player experience.
            </p>

            <p className="text-base text-gray-300 mb-10">
              Join <span className="font-semibold text-[#f39c12]">500+ certified facilities</span> across the country
            </p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { icon: Shield, text: "Safety Certified" },
                { icon: Award, text: "AIPA Approved" },
                { icon: Users, text: "Tournament Ready" },
                { icon: Star, text: "Premium Quality" },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white shadow-sm"
                >
                  <benefit.icon className="h-4 w-4 text-[#f39c12]" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/forms/court-certification/application-form">
                <Button
                  size="lg"
                  className="bg-[#f39c12] hover:bg-[#e67e22] text-white px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Begin Certification Process
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <a href="/Guideline-Court-Certifcation.pdf" download>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#2c3e50] px-8 py-3 text-base rounded-lg flex items-center transition-all duration-300"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Download Guidelines
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Court Diagram Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2 sm:mb-4">
              Official Court Specifications
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Interactive diagram showing the precise dimensions and layout requirements for AIPA certification
            </p>
          </div>

          <div className="flex flex-col items-center space-y-8 max-w-6xl mx-auto">
            {/* Court Layout Image */}
            <Card className="overflow-hidden shadow-2xl border-0 w-full">
              <CardContent className="p-6 sm:p-10">
                <div className="relative w-full h-[600px]">
                  <Image
                    src="/images/court.png"
                    alt="Pickleball Court Layout"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-xl"
                    priority
                  />
                </div>
              </CardContent>
            </Card>

            {/* Net Dimensions Image */}
            <Card className="overflow-hidden shadow-2xl border-0 w-full">
              <CardContent className="p-6 sm:p-10">
                <div className="relative w-full h-[500px]">

                  <Image
                    src="/images/court-net.png"
                    alt="Pickleball Net Dimensions"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>



        {/* Enhanced Tabs Navigation */}
        <Tabs defaultValue="overview" className="mb-12" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-2 md:grid-cols-4 h-12 sm:h-14 bg-white shadow-lg rounded-full p-1">
              <TabsTrigger value="overview" className="rounded-full font-medium text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="requirements" className="rounded-full font-medium text-xs sm:text-sm">
                Requirements
              </TabsTrigger>
              <TabsTrigger value="process" className="rounded-full font-medium text-xs sm:text-sm">
                Process
              </TabsTrigger>
              <TabsTrigger value="fees" className="rounded-full font-medium text-xs sm:text-sm">
                Fees & Terms
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            {/* Benefits Grid */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] text-center mb-8 sm:mb-12">
                Why Get AIPA Certified?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {benefits.map((benefit, index) => (
                  <Card
                    key={index}
                    className={`p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${benefit.color}`}
                  >
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-white rounded-full shadow-md">
                          {renderIcon(benefit.icon, "h-5 w-5 sm:h-6 sm:w-6 text-[#f39c12]")}
                        </div>
                        <CardTitle className="text-lg sm:text-xl text-[#2c3e50]">{benefit.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-4 sm:mb-6">
                  About Court Certification
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                  <p>
                    Obtaining pickleball court facility certification from AIPA demonstrates a commitment to providing
                    high-quality, safe, and accessible facilities for the growing pickleball community in your area.
                  </p>
                  <p>
                    Whether for recreational players or professional tournaments, certification ensures that facilities
                    meet the necessary standards and continue to offer a positive experience for everyone involved.
                  </p>
                  <p>
                    The certification process evaluates court dimensions, surface quality, net systems, lighting,
                    accessibility, and safety features to ensure they meet AIPA standards.
                  </p>
                </div>
              </div>
              <div className="relative">
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#f39c12]/10 to-[#e67e22]/10 border-[#f39c12]/20">
                  <div className="text-center">
                    <Award className="h-12 w-12 sm:h-16 sm:w-16 text-[#f39c12] mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2c3e50] mb-3 sm:mb-4">Ready to Get Started?</h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                      Join hundreds of certified facilities across the country
                    </p>
                    <Link href="/forms/court-certification/application-form">
                      <Button className="bg-[#f39c12] hover:bg-[#e67e22] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                        Apply Now
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2 sm:mb-4">Certification Requirements</h2>
              <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive standards ensuring your facility meets professional pickleball requirements
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {certificationCriteria.map((category, index) => (
                <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div
                    className="bg-gradient-to-r from-[#34495e] to-[#2c3e50] text-white p-4 sm:p-6 cursor-pointer hover:from-[#2c3e50] hover:to-[#34495e] transition-all duration-300"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {renderIcon(category.icon, "h-5 w-5 sm:h-6 sm:w-6")}
                        <h3 className="text-base sm:text-xl font-semibold">{category.title}</h3>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ${expandedSection === index ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${expandedSection === index ? "max-h-96" : "max-h-0"}`}
                  >
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody>
                            {category.items.map((item, itemIndex) => (
                              <tr key={itemIndex} className={itemIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="p-3 sm:p-4 border-b border-gray-100 font-medium text-[#34495e] w-1/3 text-xs sm:text-sm">
                                  {item.requirement}
                                </td>
                                <td className="p-3 sm:p-4 border-b border-gray-100 whitespace-pre-line text-gray-700 text-xs sm:text-sm">
                                  {item.specification}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-[#c2dfff] to-[#e9efff] border-blue-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[#f39c12] mt-1" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2c3e50] mb-3 sm:mb-4">Required Documentation</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {[
                        "Scaled plan with dimensions and features of the court",
                        "Overhead and multiple angle photos (minimum 4) of the completed court",
                        "Signed compliance declaration by facility owner/manager",
                        "Maintenance schedule documentation",
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 sm:gap-3">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-8 sm:space-y-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2 sm:mb-4">Certification Process</h2>
              <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
                A streamlined 4-step process to get your facility certified
              </p>
            </div>

            {/* Process Timeline */}
            <div className="relative max-w-4xl mx-auto">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f39c12] to-[#e67e22] transform -translate-x-1/2 rounded-full"></div>

              <div className="space-y-8 sm:space-y-16">
                {certificationProcess.map((step, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`flex flex-col md:flex-row items-center gap-6 sm:gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                    >
                      <div className="md:w-1/2">
                        <Card className="p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-[#f39c12]/10 rounded-full">
                              {renderIcon(step.icon, "h-5 w-5 sm:h-6 sm:w-6 text-[#f39c12]")}
                            </div>
                            <div>
                              <Badge variant="secondary" className="mb-1 sm:mb-2 text-xs">
                                Step {step.step}
                              </Badge>
                              <h3 className="text-base sm:text-xl font-bold text-[#2c3e50]">{step.title}</h3>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4">
                            {step.description}
                          </p>
                          <div
                            className="flex items-center gap-2 text-xs sm:text-sm text-[#f39c12] font-
medium"
                          >
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            Duration: {step.duration}
                          </div>
                        </Card>
                      </div>

                      <div className="z-10 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#f39c12] to-[#e67e22] shadow-xl">
                        <span className="text-white font-bold text-base sm:text-lg">{step.step}</span>
                      </div>

                      <div className="md:w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-r from-[#c2dfff] to-[#e9efff] border-blue-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-[#2c3e50] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#f39c12]" />
                  Inspection Details
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6">
                  During the inspection, AIPA representatives will:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    "Review blueprints and court design documents",
                    "Measure court dimensions and verify line markings",
                    "Inspect and test court surface for proper bounce and traction",
                    "Check net height and tension",
                    "Verify lighting intensity (for indoor/night play facilities)",
                    "Assess safety features and accessibility",
                    "Review maintenance procedures",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Terms Tab */}
          <TabsContent value="fees" className="space-y-8 sm:space-y-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2 sm:mb-4">Certification Fees</h2>
              <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Transparent pricing with no hidden costs
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6 sm:gap-8 mb-8 sm:mb-12 max-w-6xl mx-auto">
              {fees.map((fee, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${fee.popular ? "border-[#f39c12] border-2" : ""}`}
                >
                  {fee.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-[#f39c12] text-white text-center py-1 sm:py-2 text-xs sm:text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  <CardContent className={`p-6 sm:p-8 text-center ${fee.popular ? "pt-10 sm:pt-12" : ""}`}>
                    <h3 className="text-base sm:text-lg font-bold text-[#2c3e50] mb-3 sm:mb-4">{fee.type}</h3>
                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-4xl font-bold text-[#f39c12]">
                        ₹{fee.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">{fee.notes}</p>
                    {index === 0 ? (
                      <Link href="/forms/court-certification/application-form">
                        <Button className="w-full font-bold rounded-full transition-all duration-300 bg-[#f39c12] hover:bg-[#e67e22] text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2">
                          Apply Now
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/forms/court-certification/application-form">
                        <Button className="w-full font-bold rounded-full transition-all duration-300 bg-white border-2 border-[#f39c12] text-[#f39c12] hover:bg-[#f39c12] hover:text-white text-xs sm:text-sm py-2">
                          Begin Process
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>


            {/* Terms & Conditions */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#34495e] to-[#2c3e50] text-white p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-3 sm:space-y-4">
                  {additionalTerms.map((term, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#f39c12]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#f39c12] font-bold text-xs sm:text-sm">{index + 1}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{term}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certification Validity */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-[#2c3e50]">Certification Validity</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  AIPA Court Certification is valid for <span className="font-bold text-green-600">three years </span>
                  from the date of issuance. After this period, recertification is required to ensure continued
                  compliance with standards.
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/forms/court-certification/application-form">
                <Button
                  size="lg"
                  className="bg-[#f39c12] hover:bg-[#e67e22] text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Application
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Download Resources Section */}
        <Card className="bg-gradient-to-r from-[#c2dfff] to-[#e9efff] border-0 shadow-2xl">
          <CardContent className="p-8 sm:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2 sm:mb-4">Certification Resources</h2>
              <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Download essential documents to help you prepare for the certification process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {[
                {
                  title: "Court Certification Checklist",
                  description: "Complete checklist to prepare for certification",
                  icon: FileText,
                  link: "/pickleball-court-certification-checklist.pdf",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  title: "Certification Guidelines",
                  description: "Detailed guidelines for AIPA court certification",
                  icon: Download,
                  link: "/Guideline-Court-Certifcation.pdf",
                  color: "from-green-500 to-green-600",
                },
              ].map((resource, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden"
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div
                        className={`p-3 sm:p-4 bg-gradient-to-r ${resource.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <resource.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#2c3e50] mb-2 sm:mb-3">{resource.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                          {resource.description}
                        </p>
                        <Button
                          asChild
                          className="bg-[#f39c12] hover:bg-[#e67e22] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                        >
                          <a href={resource.link} download className="flex items-center gap-2">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            Download Now
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <Card className="bg-gradient-to-r from-[#34495e] to-[#2c3e50] text-white border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12">
              <Award className="h-12 w-12 sm:h-16 sm:w-16 text-[#f39c12] mx-auto mb-4 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Get Your Court Certified?</h2>
              <p className="text-base sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join the growing network of AIPA certified facilities and elevate your pickleball venue to professional
                standards.
              </p>
              <Link href="/forms/court-certification/application-form">
                <Button
                  size="lg"
                  className="bg-[#f39c12] hover:bg-[#e67e22] text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Begin Certification Process
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
