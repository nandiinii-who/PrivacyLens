
#ifndef PRIVACY_DETECTOR_H
#define PRIVACY_DETECTOR_H

#include <string>
#include <regex>
#include <vector>

struct SensitiveInfo {
    std::string type;
    std::string value;
};

std::vector<SensitiveInfo> detectSensitiveInfo(
    const std::string& text
) {
    std::vector<SensitiveInfo> results;

    // Regular expression for email addresses
    std::regex emailPattern(
        R"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})"
    );

    auto begin = std::sregex_iterator(
        text.begin(),
        text.end(),
        emailPattern
    );

    auto end = std::sregex_iterator();

    for (auto it = begin; it != end; ++it) {
        results.push_back({
            "Email",
            it->str()
        });
    }

    // Detect Indian mobile numbers
    std::regex phonePattern(
        R"((\+91[\s-]?)?[6-9][0-9]{9})"
    );

    auto phoneBegin = std::sregex_iterator(
        text.begin(),
        text.end(),
        phonePattern
    );

    auto phoneEnd = std::sregex_iterator();

    for (auto it = phoneBegin; it != phoneEnd; ++it) {
        results.push_back({
            "Phone Number",
            it->str()
        });
    }

    // Detect Indian PAN card numbers
    std::regex panPattern(
        R"(\b[A-Z]{5}[0-9]{4}[A-Z]\b)"
    );

    auto panBegin = std::sregex_iterator(
        text.begin(),
        text.end(),
        panPattern
    );

    auto panEnd = std::sregex_iterator();

    for (auto it = panBegin; it != panEnd; ++it) {
        results.push_back({
            "PAN Card",
            it->str()
        });
    }

    // Detect Aadhaar-like numbers (12 digits)
    std::regex aadhaarPattern(
        R"(\b[2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b)"
    );

    auto aadhaarBegin = std::sregex_iterator(
        text.begin(),
        text.end(),
        aadhaarPattern
    );

    auto aadhaarEnd = std::sregex_iterator();

    for (auto it = aadhaarBegin; it != aadhaarEnd; ++it) {
        results.push_back({
            "Aadhaar Number",
            it->str()
        });
    }


    return results;
}

#endif
