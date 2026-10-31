
#include "crow.h"
#include <crow/middlewares/cors.h>
#include <iostream>
#include "privacy_detector.h"

int main() {

    crow::App<crow::CORSHandler> app;

    // Allow frontend requests during local development
    auto& cors = app.get_middleware<crow::CORSHandler>();

    cors.global()
        .origin("*")
        .methods("GET"_method, "POST"_method);

    // Homepage
    CROW_ROUTE(app, "/")([]() {
        return "PrivacyLens Backend is Running!";
    });

    // API status
    CROW_ROUTE(app, "/api/status")([]() {

        crow::json::wvalue response;

        response["status"] = "success";
        response["message"] = "PrivacyLens Backend Connected";

        return response;
    });

CROW_ROUTE(app, "/api/detect")
.methods("POST"_method)
([](const crow::request& req) {

    // Read JSON sent from the frontend
    auto body = crow::json::load(req.body);

    if (!body || !body.has("text") ||
        body["text"].t() != crow::json::type::String) {
        return crow::response(
            400,
            "Invalid request: text is required"
        );
    }

    std::string text = body["text"].s();

    // Run our C++ detection function
    auto detected = detectSensitiveInfo(text);

    // Prepare JSON response
    crow::json::wvalue result;
    result["count"] = static_cast<int>(detected.size());

    std::vector<crow::json::wvalue> matches;

    for (const auto& item : detected) {
        crow::json::wvalue match;

        match["type"] = item.type;
        match["value"] = item.value;

        matches.push_back(std::move(match));
    }

    result["matches"] = std::move(matches);

    crow::response response(result);
    response.set_header("Content-Type", "application/json");

    return response;
});

    app.port(18080).multithreaded().run();

    return 0;
}

