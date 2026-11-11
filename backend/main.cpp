//
// Created by Salko on 09-Oct-26.
//

#include "crow.h"
#include "crow/middlewares/cors.h"
#include <vector>
#include "cpr/cpr.h"
#include "csv.hpp"

#define CROW_JSON_USE_INSERTION_ORDER

using namespace std;

class Lecture
{
    public:
    enum Rooms
    {
        P11,
        P22,
        AULA,
        SBOROVNA,
        USV,
        P23,
        NONE
    };

    enum Day
    {
        Monday,
        Tuesday,
        Wednesday
    };

    private:
    u_int _id;
    Day _day;
    string _time_start;
    string _time_end;
    Rooms room; // This could be an enum
    string presenter;
    string title;
    string annotation;
    string medallion;

    public:
    u_int get_id() const { return _id; }
    Day get_day() const { return _day; }
    const string& get_time_start() const { return _time_start; }
    const string& get_time_end() const { return _time_end; }

    const map<Rooms, string> room_names = {
        {P11, "P1.1"},
        {P22, "P2.2"},
        {AULA, "Aula"},
        {SBOROVNA, "Sborovna"},
        {USV, "USV"},
        {P23, "P2.3"},
        {NONE, ""}
    };

    const map<Day, string> day_names = {
        {Monday, "Pondělí"},
        {Tuesday, "Úterý"},
        {Wednesday, "Středa"},
    };

    Lecture(const u_int& id, const Day& day, const string& time_start, const string& time_end, const Rooms& room, const string& presenter, const string& title, const string& annotation, const string& medallion) : _id(id), _day(day), _time_start(time_start), _time_end(time_end), room(room), presenter(presenter), title(title), annotation(annotation), medallion(medallion)
    {}

    crow::json::wvalue overview()
    {
        crow::json::wvalue json = {
            {"id", _id},
            {"title", title},
            {"name", presenter},
            {"room", room_names.at(room)},
            {"start_time", _time_start},
            {"end_time", _time_end},
        };

        return json;
    }

    crow::json::wvalue detail()
    {
        crow::json::wvalue json = {
            {"annotation", annotation},
            {"profile", medallion},
            {"id", _id},
            {"title", title},
            {"name", presenter},
            {"room", room_names.at(room)},
            {"start_time", _time_start},
            {"end_time", _time_end},
        };

        return json;
    }

    crow::json::wvalue Jsonify()
    {
        crow::json::wvalue json = {
            {"id", _id},
            {"day", day_names.at(_day)},
            {"start_time", _time_start},
            {"end_time", _time_end},
            {"room", room_names.at(room)},
            {"name", presenter},
            {"title", title},
            {"annotation", annotation},
            {"medallion", medallion}
        };

        return json;
    }
};

class Harmonogram
{
    bool is_ready = false;

    string URL = "https://docs.google.com/spreadsheets/d/1JpmNZXqIA_AQWs6JQbDYk9MqxdLqfUBAFA9d9XpK8ek/export?format=csv";
    map<u_int, vector<string>> day_block_times {
        {0, {"10:00", "13:00", "15:00", "17:00", "19:00"}},
        {1, {"09:00", "11:00", "14:00", "16:00"}},
        {2, {"09:00", "11:00", "14:00", "16:00"}}
    };

    vector<Lecture> lectures;
    crow::json::wvalue harmonogram;

    public:
    Harmonogram()
    {
        fetch_data();
    }

    const map<string, Lecture::Rooms> rooms = {
        {"P1.1", Lecture::Rooms::P11},
        {"P2.2", Lecture::Rooms::P22, },
        {"Aula", Lecture::Rooms::AULA},
        {"Sborovna", Lecture::Rooms::SBOROVNA},
        {"USV", Lecture::Rooms::USV},
        {"P2.3", Lecture::Rooms::P23},
    };

    const map<string, Lecture::Day> day_abbreviations = {
        {"po", Lecture::Day::Monday},
        {"út", Lecture::Day::Tuesday},
        {"st", Lecture::Day::Wednesday},
    };

    const map<Lecture::Day, string> day_full_names = {
        {Lecture::Day::Monday, "Pondělí"},
        {Lecture::Day::Tuesday, "Úterý"},
        {Lecture::Day::Wednesday, "Středa"},
    };

    void fetch_data()
    {
        cpr::Response r = cpr::Get(cpr::Url{URL});

        csv::CSVReader reader = csv::parse(r.text);

        u_int row_num = 0;

        for (csv::CSVRow row : reader)
        {
            string name = row["Jméno"];
            string title = row["název"];
            string annotation = row["anotace"];
            string medallion = row["medailonek"];
            string time = "";
            Lecture::Day day;
            string time_start = "";
            string time_end = "";

            try
            {
                time = (row["čas"] == "" || ((string) row["čas"]).find("so") != string::npos) ? string("") : row["čas"];
            } catch (exception e)
            {
                cout << "Time could not be cast to a string?: " << row.raw_str() << endl;
            }
            if (time == "") // Meaning this isn't in the harmonogram yet
            {
                continue;
            }

            stringstream time_stream(time);
            string part;

            for (int i = 0; i < 4; i++)
            {
                time_stream >> part;
                switch (i)
                {
                    case 0:
                        day = day_abbreviations.at(part);
                        break;
                    case 1:
                        time_start = part;
                        break;
                    case 3:
                        time_end = part;
                        break;
                }
            }

            Lecture::Rooms room = Lecture::Rooms::NONE;
            try
            {
                room = rooms.at(row["místo"]);
            } catch (exception e)
            {
                cout << "Could not find room for: " << row.raw_str() << endl;
            }

            lectures.push_back(Lecture(row_num, day, time_start, time_end, room, name, title, annotation, medallion));
            row_num++;
        }

        try
        {
            jsonify_harmonogram();
        } catch (exception e)
        {
            cout << string("Error jsonifying harmonogram: ") + e.what() << endl;
        }
    }

    /// This will create a full json representation of the current harmonogram, including separation into days and times.
    void jsonify_harmonogram()
    {
        crow::json::wvalue harmonogram;

        istringstream time_stream("Thu, 1 Jan 1970 00:00:00");

        tm time;
        time_stream >> get_time(&time, "%a, %d %b %Y %H:%M:%S");

        crow::json::wvalue::list days;

        for (u_int day_id = 0; day_id < 3; day_id++) // For each day
        {
            crow::json::wvalue day;
            crow::json::wvalue::list day_blocks;

            for (string block_start_time : day_block_times[day_id]) // For each time block
            {
                u_int total_presentations = 0;
                crow::json::wvalue block;
                crow::json::wvalue::list block_lectures;

                for (Lecture lect : lectures) // The presentation could be anywhere...
                {
                    if (lect.get_day() == day_id && lect.get_time_start() == block_start_time)
                    {
                        total_presentations++;
                        block_lectures.push_back(lect.overview());
                    }
                    if (total_presentations >= 6) break;
                }

                block["time"] = block_start_time;
                block["lectures"] = move(block_lectures);
                day_blocks.push_back(block);
            }

            day["day"] = day_full_names.at(Lecture::Day(day_id));
            day["times"] = move(day_blocks);
            days.push_back(day);
        }

        harmonogram["update_time"] = time_stream.str();
        harmonogram["days"] = move(days);

        this->harmonogram = move(harmonogram);

        is_ready = true;
    }

    bool harmonogram_ready()
    {
        return is_ready;
    }

    crow::json::wvalue get_details(int id)
    {
        Lecture& suspected_lecture = lectures[id];
        if (suspected_lecture.get_id() == id) // Assumes they are sorted
        {
            return lectures[id].detail();
        }
        for (Lecture lect : lectures) // In case they somehow aren't
        {
            if (lect.get_id() == id)
            {
                return lect.detail();
            }
        }
        return crow::json::wvalue("404 not found");
    }

    crow::json::wvalue get_harmonogram()
    {
        return harmonogram;
    }
};

int main()
{
    crow::App<crow::CORSHandler> app;
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors
      .global()
        .headers("*")
        .methods("GET"_method)
        .origin("*");

    Harmonogram h = Harmonogram();

    CROW_ROUTE(app, "/")([&h](){
        return "Hello world";
    });

    CROW_ROUTE(app, "/API/harmonogram")([&h](){
        try
        {
            if (h.harmonogram_ready())
            {
                crow::json::wvalue res = h.get_harmonogram();
                return crow::response(200, res);;
            }
            return crow::response(503, "Harmonogram not ready.");
        } catch (exception e)
        {
            return crow::response(500, string("General server error: ") + e.what());
        }
    });

    CROW_ROUTE(app, "/API/prednaska/<int>")([&h](int id){
        try
        {
            if (h.harmonogram_ready())
            {
                crow::json::wvalue res = h.get_details(id);
                return crow::response(200, res);
            }
            return crow::response(503, "Harmonogram not ready.");
        } catch (exception e)
        {
            return crow::response(500, string("General server error: ") + e.what());
        }
    });

    app.port(8080).multithreaded().run();
}