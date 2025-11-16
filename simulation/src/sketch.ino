/*******************************************************
 * SMART BULB & FAN IoT SYSTEM (MQTT + AUTO/MANUAL + BUTTON CONTROL)
 * Author: nikhil, Sumit Kumar, Akshat Kumar, Vishal Thakur
 *******************************************************/

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ---------- Pin Definitions ----------
#define DHT_PIN 15
#define PIR_PIN 14
#define LED_BULB 2
#define FAN_PWM_PIN 4
#define RELAY_PIN 13

#define BTN_MODE 32
#define BTN_BULB 33
#define BTN_FAN 5

#define RGB_R_PIN 25
#define RGB_G_PIN 26
#define RGB_B_PIN 27

#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// ---------- OLED ----------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ---------- WiFi ----------
const char *ssid = "Wokwi-GUEST";
const char *password = "";
const char *mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
PubSubClient client(espClient);

// ---------- Variables ----------
bool motion = false;
bool bulbOn = false;
bool fanOn = false;
bool isManualMode = false;

int fanSpeed = 100;
unsigned long lastMotionTime = 0;

unsigned long lastModePress = 0;
unsigned long lastFanPress = 0;
unsigned long lastBulbPress = 0;

const unsigned long DEBOUNCE_DELAY = 400;
const unsigned long MOTION_DELAY = 30000;

char colorHEX[8] = "#FFFFFF";

// ---------- MQTT Topics ----------
#define TOPIC_TEMP "nikhil/home/temp"
#define TOPIC_HUM "nikhil/home/hum"
#define TOPIC_BULB "nikhil/home/bulb"
#define TOPIC_FAN "nikhil/home/fan"
#define TOPIC_FAN_SPEED "nikhil/home/fan/speed"
#define TOPIC_COLOR "nikhil/home/color"
#define TOPIC_MODE "nikhil/home/mode"
#define TOPIC_MOTION "nikhil/home/motion"

#define TOPIC_CTRL_BULB "nikhil/home/control/bulb"
#define TOPIC_CTRL_FAN "nikhil/home/control/fan"
#define TOPIC_CTRL_FAN_SPEED "nikhil/home/control/fan/speed"
#define TOPIC_CTRL_COLOR "nikhil/home/control/color"
#define TOPIC_CTRL_MODE "nikhil/home/control/mode"

// ---------- Interrupt ----------
void IRAM_ATTR motionISR()
{
  motion = true;
  lastMotionTime = millis();
  Serial.println("📡 PIR detected motion!");
}

// ---------- RGB ----------
void setRGB(uint8_t r, uint8_t g, uint8_t b)
{
  analogWrite(RGB_R_PIN, r);
  analogWrite(RGB_G_PIN, g);
  analogWrite(RGB_B_PIN, b);
  sprintf(colorHEX, "#%02X%02X%02X", r, g, b);
  client.publish(TOPIC_COLOR, colorHEX);
  Serial.printf("🎨 RGB Color Set: R=%d, G=%d, B=%d (%s)\n", r, g, b, colorHEX);
}

// ---------- Device Control ----------
void setBulb(bool state, bool fromManual = false)
{
  bulbOn = state;
  digitalWrite(LED_BULB, state ? HIGH : LOW);
  client.publish(TOPIC_BULB, state ? "ON" : "OFF");
  Serial.printf("💡 Bulb %s [%s]\n", state ? "ON" : "OFF", fromManual ? "MANUAL" : "AUTO");

  if (fromManual)
  {
    isManualMode = true;
    client.publish(TOPIC_MODE, "MANUAL");
    Serial.println("🔧 Switched to MANUAL mode (Bulb control)");
  }
}

void setFan(bool state, bool fromManual = false)
{
  fanOn = state;
  digitalWrite(RELAY_PIN, state ? HIGH : LOW);
  analogWrite(FAN_PWM_PIN, fanOn ? map(fanSpeed, 0, 100, 0, 255) : 0);

  client.publish(TOPIC_FAN, state ? "ON" : "OFF");
  Serial.printf("🌀 Fan %s @ %d%% [%s]\n", state ? "ON" : "OFF", fanSpeed, fromManual ? "MANUAL" : "AUTO");

  if (fromManual)
  {
    isManualMode = true;
    client.publish(TOPIC_MODE, "MANUAL");
    Serial.println("🔧 Switched to MANUAL mode (Fan control)");
  }
}

void setFanSpeed(int speed)
{
  fanSpeed = constrain(speed, 0, 100);
  if (fanOn)
    analogWrite(FAN_PWM_PIN, map(fanSpeed, 0, 100, 0, 255));
  char buf[8];
  sprintf(buf, "%d", fanSpeed);
  client.publish(TOPIC_FAN_SPEED, buf);
  Serial.printf("⚡ Fan Speed Set: %d%%\n", fanSpeed);
}

// ---------- OLED WITH MOTION TIME ----------
void updateOLED(float t, float h)
{
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(0, 0);
  display.println("Smart Home (MQTT)");

  display.setCursor(0, 12);
  display.printf("Temp: %.1f C", t);

  display.setCursor(0, 22);
  display.printf("Hum : %.1f %%", h);

  display.setCursor(0, 32);
  display.printf("Bulb:%s Fan:%s", bulbOn ? "ON" : "OFF", fanOn ? "ON" : "OFF");

  display.setCursor(0, 42);
  display.printf("Mode:%s Spd:%d%%", isManualMode ? "MAN" : "AUTO", fanSpeed);

  // ---- NEW MOTION STATUS LINE ----
  display.setCursor(0, 54);
  unsigned long inactive = (millis() - lastMotionTime) / 1000;

  if (inactive < 3)
    display.print("Motion: DETECTED");
  else
    display.printf("Motion: NONE (%lus ago)", inactive);

  display.display();
}

// ---------- Mode Toggle ----------
void toggleMode()
{
  isManualMode = !isManualMode;
  client.publish(TOPIC_MODE, isManualMode ? "MANUAL" : "AUTO");
  Serial.printf("🔄 Mode Toggled: %s\n", isManualMode ? "MANUAL" : "AUTO");
}

// ---------- Publish All States ----------
void publishAllStates()
{
  client.publish(TOPIC_MODE, isManualMode ? "MANUAL" : "AUTO");
  client.publish(TOPIC_BULB, bulbOn ? "ON" : "OFF");
  client.publish(TOPIC_FAN, fanOn ? "ON" : "OFF");
  client.publish(TOPIC_COLOR, colorHEX);

  char buf[8];
  sprintf(buf, "%d", fanSpeed);
  client.publish(TOPIC_FAN_SPEED, buf);

  client.publish(TOPIC_MOTION, "NONE");
  Serial.println("📤 Published all states to MQTT");
}

// ---------- MQTT Callback ----------
void callback(char *topic, byte *message, unsigned int length)
{
  String msg;
  for (int i = 0; i < length; i++)
    msg += (char)message[i];

  Serial.printf("📥 MQTT Received: %s = %s\n", topic, msg.c_str());

  if (String(topic) == TOPIC_CTRL_BULB)
    setBulb(msg == "ON", true);
  else if (String(topic) == TOPIC_CTRL_FAN)
    setFan(msg == "ON", true);
  else if (String(topic) == TOPIC_CTRL_FAN_SPEED)
    setFanSpeed(msg.toInt());
  else if (String(topic) == TOPIC_CTRL_COLOR)
  {
    uint8_t r = strtol(msg.substring(1, 3).c_str(), NULL, 16);
    uint8_t g = strtol(msg.substring(3, 5).c_str(), NULL, 16);
    uint8_t b = strtol(msg.substring(5, 7).c_str(), NULL, 16);
    setRGB(r, g, b);
  }
  else if (String(topic) == TOPIC_CTRL_MODE)
    toggleMode();
}

void reconnectMQTT()
{
  while (!client.connected())
  {
    Serial.println("🔌 Connecting to MQTT broker...");
    if (client.connect("esp32-nikhil"))
    {
      Serial.println("✅ MQTT Connected!");
      client.subscribe(TOPIC_CTRL_BULB);
      client.subscribe(TOPIC_CTRL_FAN);
      client.subscribe(TOPIC_CTRL_FAN_SPEED);
      client.subscribe(TOPIC_CTRL_COLOR);
      client.subscribe(TOPIC_CTRL_MODE);
      Serial.println("📡 Subscribed to all control topics");
      publishAllStates();
    }
    else
    {
      Serial.printf("❌ MQTT connection failed, rc=%d. Retrying...\n", client.state());
    }
    delay(800);
  }
}

void setupWiFi()
{
  Serial.printf("📶 Connecting to WiFi: %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(200);
    Serial.print(".");
  }
  Serial.printf("\n✅ WiFi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
}

// ---------- Setup ----------
void setup()
{
  Serial.begin(115200);
  delay(500);
  Serial.println("\n\n" + String('=').substring(0, 50));
  Serial.println("🏠 SMART HOME IoT SYSTEM");
  Serial.println("   by Nikhil, Sumit, Akshat, Vishal");
  Serial.println(String('=').substring(0, 50));

  Serial.println("⚙️  Initializing hardware...");
  pinMode(LED_BULB, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT_PULLDOWN);
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(BTN_FAN, INPUT_PULLUP);
  pinMode(BTN_BULB, INPUT_PULLUP);
  Serial.println("✅ GPIO pins configured");

  attachInterrupt(digitalPinToInterrupt(PIR_PIN), motionISR, RISING);
  Serial.println("✅ PIR interrupt attached");

  dht.begin();
  Serial.println("✅ DHT22 sensor initialized");

  setRGB(255, 255, 255);
  Serial.println("✅ RGB LED initialized");

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  Serial.println("✅ OLED display initialized");

  // ---------- CLEAN MINIMAL BOOT ANIMATION ----------
  Serial.println("🎬 Starting boot animation...");
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  for (int i = 0; i <= 100; i += 5)
  {
    display.clearDisplay();
    display.setCursor(20, 20);
    display.println("Booting...");
    display.setCursor(18, 35);
    display.printf("[%3d%%]", i);

    int bar = map(i, 0, 100, 0, 100);
    display.fillRect(10, 50, bar, 6, SSD1306_WHITE);
    display.drawRect(10, 50, 100, 6, SSD1306_WHITE);

    display.display();
    delay(80);
  }

  setupWiFi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  Serial.printf("✅ MQTT server set: %s:1883\n", mqtt_server);
  Serial.println("\n🚀 System Ready!\n");
}

// ---------- Loop ----------
void loop()
{
  if (!client.connected())
    reconnectMQTT();
  client.loop();

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  static unsigned long lastSensorLog = 0;
  if (millis() - lastSensorLog > 10000)
  {
    lastSensorLog = millis();
    Serial.printf("🌡️  Temp: %.1f°C | Humidity: %.1f%% | Mode: %s | Bulb: %s | Fan: %s @ %d%%\n",
                  t, h, isManualMode ? "MANUAL" : "AUTO",
                  bulbOn ? "ON" : "OFF", fanOn ? "ON" : "OFF", fanSpeed);
  }

  // BUTTON HANDLING
  if (digitalRead(BTN_MODE) == LOW && millis() - lastModePress > DEBOUNCE_DELAY)
  {
    lastModePress = millis();
    Serial.println("🔘 MODE button pressed");
    toggleMode();
  }

  if (digitalRead(BTN_FAN) == LOW && millis() - lastFanPress > DEBOUNCE_DELAY)
  {
    lastFanPress = millis();
    Serial.println("🔘 FAN button pressed");
    if (!isManualMode)
    {
      isManualMode = true;
      client.publish(TOPIC_MODE, "MANUAL");
    }
    setFan(!fanOn, true);
  }

  if (digitalRead(BTN_BULB) == LOW && millis() - lastBulbPress > DEBOUNCE_DELAY)
  {
    lastBulbPress = millis();
    Serial.println("🔘 BULB button pressed");
    if (!isManualMode)
    {
      isManualMode = true;
      client.publish(TOPIC_MODE, "MANUAL");
    }
    setBulb(!bulbOn, true);
  }

  // PIR MQTT PUBLISHING
  static bool sentNone = true;

  if (motion)
  {
    motion = false;
    client.publish(TOPIC_MOTION, "DETECTED");
    sentNone = false;
  }

  if (millis() - lastMotionTime > MOTION_DELAY && !sentNone)
  {
    client.publish(TOPIC_MOTION, "NONE");
    sentNone = true;
  }

  // AUTO MODE
  if (!isManualMode)
  {
    if (!isnan(t))
    {
      if (t > 28 && !fanOn)
      {
        Serial.printf("🌡️  AUTO: Temperature %.1f°C > 28°C, turning fan ON\n", t);
        setFan(true);
      }
      if (t <= 28 && fanOn)
      {
        Serial.printf("🌡️  AUTO: Temperature %.1f°C <= 28°C, turning fan OFF\n", t);
        setFan(false);
      }
    }

    if (millis() - lastMotionTime < MOTION_DELAY && !bulbOn)
    {
      Serial.println("👁️  AUTO: Motion detected, turning bulb ON");
      setBulb(true);
    }
    else if (millis() - lastMotionTime >= MOTION_DELAY && bulbOn)
    {
      Serial.println("👁️  AUTO: No motion for 30s, turning bulb OFF");
      setBulb(false);
    }
  }

  // Sensor Data Publish
  static unsigned long lastPub = 0;
  if (millis() - lastPub > 5000)
  {
    lastPub = millis();
    char buf[8];
    sprintf(buf, "%.1f", t);
    client.publish(TOPIC_TEMP, buf);
    sprintf(buf, "%.1f", h);
    client.publish(TOPIC_HUM, buf);
    sprintf(buf, "%d", fanSpeed);
    client.publish(TOPIC_FAN_SPEED, buf);
  }

  updateOLED(t, h);
  delay(80);
}
