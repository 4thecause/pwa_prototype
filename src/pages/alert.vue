<template>
  <div>
    <VCard
      title="MQTT Explorer"
    >
      <VCardText
        class="position-absolute"
        style="top: 0.5em;right: 0;"
      >
        <VBadge
          icon="tabler-access-point"
          :color="data.isConnected ? 'success' : 'error'"
        >
          <VTooltip
            activator="parent"
            location="end"
          >
            {{ data.isConnected ? 'Connected' : 'Disconnected' }}
          </VTooltip>
        </VBadge>
      </VCardText>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <VTabs
              v-model="currentTab"
              direction="vertical"
            >
              <VTab
                v-for="n in data.tabs"
                :key="n"
                :value="n"
                class="vtab"
              >
                {{ n }}
                <VDivider />
              </VTab>
            </VTabs>
          </VCol>
          <VDivider vertical />
          <VCol
            cols="12"
            md="9"
          >
            <VWindow
              v-model="currentTab"
              class="ms-3"
            >
              <VWindowItem
                v-for="n in data.tabs"
                :key="n"
                :value="n"
              >
                Tab {{ n }}

                <JsonTree
                  class="vtab"
                  :data="data.mqtt_messages[n]"
                  :level="0"
                />
              </VWindowItem>
            </VWindow>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>


    <VCard
      title="MQTT"
    >
      <VCardText>
        <VTextarea
          v-model="data.publish"
          label="Publish"
          auto-grow
        />
      </VCardText> <VCardText>
        <VBtn
          ref="publishButton"
          inline
          color="primary"
          @click="publish"
        >
          Publish
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import { useMQTT } from 'mqtt-vue-hook'
import { ref } from 'vue'
import JsonTree from 'vue-json-tree'

const mqtt_client = useMQTT()

function connect() {
  console.log('connecting')
  mqtt_client.connect(`${data.value.protocol}://${data.value.host}:${data.value.port}`, {
    clean: false,
    keepalive: 60,
    clientId: `mqtt_client_${Math.random().toString(16).substring(2, 10)}`,
    connectTimeout: 4000,
    username: 'telemetry', password: 'UWOeDZGUlbd3Q5sWn9xqEG0A',
  }).then(() => {
    console.log('connected')
    subscribe()
  }, error => {
    console.log('error', error)
  })
}

function publish() {
  mqtt_client.publish(
    'web_client/brian',
    JSON.stringify({
      msg: "Hello from the web client",
      live: new Date().toISOString(),
    }),
  )
}

function subscribe() {
  mqtt_client.subscribe(['#'], 1)

  mqtt_client.registerEvent(
    '#/',
    (topic, message) => {

      const msg2json = msg => {
        try {
          return JSON.parse(msg)
        } catch (error) {
          return msg
        }
      }

      const mesJson = msg2json(message.toString())

      //console.log("event:", { topic, type: typeof mesJson, mesJson })

      const splitString = topic.split("/")

      if (data.value.tabs.indexOf(splitString[0]) === -1)
        data.value.tabs.push(splitString[0])

      const createNestedObject = (obj, keys, value) => {
        const [key, ...rest] = keys
        if (!obj[key]) {
          obj[key] = {}
        }
        if (rest.length === 0) {
          obj[key] = []
          obj[key].push(value)

          return
        }
        createNestedObject(obj[key], rest, value)
      }

      createNestedObject(data.value.mqtt_messages, splitString, mesJson)

    },
    'key',
  )

  mqtt_client.registerEvent(
    'on-connect', // mqtt status: on-connect, on-reconnect, on-disconnect, on-connect-fail
    (topic, message) => {
      data.value.isConnected = mqtt_client.isConnected()
      console.log("event:", { topic, msg: message.toString() },{ ...arguments })

      /*           new Notification({
            title: topic,
            message: message.toString(),
            type: 'info',
          }) */
    },'key',
  )

  //mqtt_client.unSubscribe('#')
  console.log('events registered!')
}


const data = ref({
  host:'mq.dev.responsetech.ltd',
  port:61619,
  protocol:'wss',
  textareaValue: '',
  mqtt_messages: {},
  isConnected: mqtt_client.isConnected(),
  client: mqtt_client.client,
  tabs:[
  ],

})

const currentTab = ref(0)

onMounted(() => {
  mqtt_client.isConnected() ? subscribe() : connect()
})

watch(data.value.tabs, newValue => {
  currentTab.value = newValue - 1
})
</script>
