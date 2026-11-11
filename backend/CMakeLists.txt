cmake_minimum_required(VERSION 4.2)
project(backend VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

FetchContent_Declare(
        asio
        GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
        GIT_TAG        asio-1-30-2 # Modern stable tag
)
FetchContent_MakeAvailable(asio)

set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "Path to Asio include dir")

message("${asio_SOURCE_DIR}/asio/include")

set(Asio_DIR "${asio_SOURCE_DIR}/asio/src" CACHE PATH "Path to Asio CMake Config" FORCE)
set(asio_DIR "${asio_SOURCE_DIR}/asio/src" CACHE PATH "Path to Asio CMake Config" FORCE)

FetchContent_Declare(
        Crow
        GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
        GIT_TAG        v1.3.4
)

set(CROW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(CROW_BUILD_TESTS OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(Crow)

FetchContent_Declare(
        csv
        GIT_REPOSITORY https://github.com/vincentlaucsb/csv-parser
        GIT_TAG        v5.7.1
)
FetchContent_MakeAvailable(csv)

FetchContent_Declare(cpr GIT_REPOSITORY https://github.com/libcpr/cpr.git
        GIT_TAG 1.14.2)
set(CPR_USE_SYSTEM_CURL ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(cpr)

include_directories(.)

add_executable(backend
        main.cpp)

target_compile_definitions(backend PRIVATE ASIO_STANDALONE)

target_link_libraries(backend PRIVATE Crow::Crow cpr::cpr csv)