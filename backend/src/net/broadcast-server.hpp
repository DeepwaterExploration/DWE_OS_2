#ifndef BROADCAST_SERVER_HPP
#define BROADCAST_SERVER_HPP

#include <pthread.h>

#include <nlohmann/json.hpp>
#include <set>
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>

typedef websocketpp::server<websocketpp::config::asio> server;
using json = nlohmann::json;

using websocketpp::lib::bind;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;

typedef server::message_ptr message_ptr;

class BroadcastServer {
    public:
    void start(int port);

    void stop();

    void broadcast(std::string raw_msg);

    void emit(std::string event_name, json msg);

    private:
    typedef std::set<websocketpp::connection_hdl,
        std::owner_less<websocketpp::connection_hdl>>
        con_list;

    void _run(void *);

    void _on_open(websocketpp::connection_hdl hdl);

    void _on_close(websocketpp::connection_hdl hdl);

    server _ws;
    con_list _connections;
    pthread_t _thread;
};

#endif
