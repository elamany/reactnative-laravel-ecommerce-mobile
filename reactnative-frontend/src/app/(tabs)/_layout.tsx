import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  focused,
}: {
  name: IoniconName;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? '#2563EB' : '#6b7280'}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Tab bar colors
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6b7280',

        // Tab bar style
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#ffffff',
        },

        // Label style
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Products */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'bag-handle' : 'bag-handle-outline'}
              focused={focused}
            />
          ),
        }}
      />

      {/* Cart */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'cart' : 'cart-outline'}
              focused={focused}
            />
          ),
        }}
      />

      {/* Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'receipt' : 'receipt-outline'}
              focused={focused}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}