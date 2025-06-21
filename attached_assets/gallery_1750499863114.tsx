import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LottieLoader } from "@/components/lottie-loader";
import {
  Calendar,
  Star,
  Rocket,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Share,
} from "lucide-react";
import { ApodImage } from "@/types/space";

export default function Gallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [selectedImage, setSelectedImage] = useState<ApodImage | null>(null);

  useEffect(() => {
    document.title =
      "Astronomy Gallery - Space Exploration Platform | NASA's Picture of the Day Collection";
  }, []);

  const {
    data: allImages,
    isLoading,
    error,
  } = useQuery<ApodImage[]>({
    queryKey: ["/api/apod"],
    queryFn: async () => {
      const response = await fetch("/api/apod?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch APOD images");
      }
      return response.json();
    },
  });

  // Filter images based on selected filter
  const filteredImages =
    allImages?.filter((image) => {
      switch (selectedFilter) {
        case "latest":
          return true; // Show all for latest
        case "popular":
          return (
            image.title.toLowerCase().includes("nebula") ||
            image.title.toLowerCase().includes("galaxy") ||
            image.title.toLowerCase().includes("hubble") ||
            image.title.toLowerCase().includes("mars") ||
            image.title.toLowerCase().includes("jupiter")
          );
        case "missions":
          return (
            image.title.toLowerCase().includes("mission") ||
            image.title.toLowerCase().includes("rover") ||
            image.title.toLowerCase().includes("spacecraft") ||
            image.title.toLowerCase().includes("apollo") ||
            image.title.toLowerCase().includes("artemis") ||
            image.title.toLowerCase().includes("parker") ||
            image.title.toLowerCase().includes("juno") ||
            image.title.toLowerCase().includes("cassini")
          );
        case "earth":
          return (
            image.title.toLowerCase().includes("earth") ||
            image.title.toLowerCase().includes("aurora") ||
            image.title.toLowerCase().includes("lightning") ||
            image.title.toLowerCase().includes("atmosphere") ||
            image.title.toLowerCase().includes("satellite")
          );
        default:
          return true;
      }
    }) || [];

  // Paginate filtered results
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const images = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const filters = [
    { id: "latest", label: "Latest", icon: Calendar },
    { id: "popular", label: "Most Popular", icon: Star },
    { id: "missions", label: "Space Missions", icon: Rocket },
    { id: "earth", label: "Earth Views", icon: Globe },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(217,91%,29%)] to-[hsl(222,47%,8%)]">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Astronomy Gallery
            </h1>
            <p className="text-red-400">
              Failed to load images. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white text-xs sm:text-sm">
              NASA's Daily Collection
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Astronomy Gallery
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Discover the cosmos through NASA's daily featured astronomical
              images, carefully curated and explained by professional
              astronomers.
            </p>

            {/* Filter Controls - Mobile Responsive */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-4 sm:px-0">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const filterCount =
                  allImages?.filter((image) => {
                    switch (filter.id) {
                      case "latest":
                        return true;
                      case "popular":
                        return (
                          image.title.toLowerCase().includes("nebula") ||
                          image.title.toLowerCase().includes("galaxy") ||
                          image.title.toLowerCase().includes("hubble") ||
                          image.title.toLowerCase().includes("mars") ||
                          image.title.toLowerCase().includes("jupiter")
                        );
                      case "missions":
                        return (
                          image.title.toLowerCase().includes("mission") ||
                          image.title.toLowerCase().includes("rover") ||
                          image.title.toLowerCase().includes("spacecraft") ||
                          image.title.toLowerCase().includes("apollo") ||
                          image.title.toLowerCase().includes("artemis") ||
                          image.title.toLowerCase().includes("parker") ||
                          image.title.toLowerCase().includes("juno") ||
                          image.title.toLowerCase().includes("cassini")
                        );
                      case "earth":
                        return (
                          image.title.toLowerCase().includes("earth") ||
                          image.title.toLowerCase().includes("aurora") ||
                          image.title.toLowerCase().includes("lightning") ||
                          image.title.toLowerCase().includes("atmosphere") ||
                          image.title.toLowerCase().includes("satellite")
                        );
                      default:
                        return true;
                    }
                  })?.length || 0;

                return (
                  <Button
                    key={filter.id}
                    variant={
                      selectedFilter === filter.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedFilter(filter.id)}
                    size="sm"
                    className={`glass-morphism transition-all duration-300 text-xs sm:text-sm ${
                      selectedFilter === filter.id
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">
                      {filter.label.split(" ")[0]}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-1 sm:ml-2 bg-white/20 text-white text-xs"
                    >
                      {filterCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid - Mobile Optimized */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <LottieLoader size={80} className="mb-4 sm:mb-6" />
              <p className="text-base sm:text-lg opacity-70 mb-6 sm:mb-8">
                Loading cosmic imagery...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Card key={index} className="glass-morphism">
                    <div className="w-full h-48 sm:h-64 bg-gray-800/50 rounded-t-lg animate-pulse" />
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-3 sm:h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-2 sm:h-3 bg-gray-700/50 rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {images?.map((image, index) => (
                <Card
                  key={image.id}
                  className="group glass-morphism cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay Icons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-black/50 text-white hover:bg-black/70"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-black/50 text-white hover:bg-black/70"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-black/50 text-white hover:bg-black/70"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white group-hover:text-cyan-300 transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {new Date(image.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {image.explanation}
                    </p>

                    {image.copyright && (
                      <Badge
                        variant="outline"
                        className="mt-3 border-gray-600/50 text-gray-400"
                      >
                        © {image.copyright}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && images && images.length > 0 && (
            <div className="flex justify-center items-center mt-16 space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="glass-morphism border-white/20 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        pageNum === currentPage
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "glass-morphism border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
                className="glass-morphism border-white/20 text-white hover:bg-white/10"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-6xl w-full bg-gray-900/95 rounded-2xl overflow-y-auto my-8 max-h-[calc(100vh-4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedImage.hdurl || selectedImage.url}
                alt={selectedImage.title}
                className="w-full max-h-[60vh] object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 z-10"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </Button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedImage.title}
              </h2>
              <p className="text-gray-400 mb-4">
                {new Date(selectedImage.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-300 leading-relaxed">
                {selectedImage.explanation}
              </p>

              {selectedImage.copyright && (
                <Badge
                  variant="outline"
                  className="mt-4 border-gray-600/50 text-gray-400"
                >
                  © {selectedImage.copyright}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
