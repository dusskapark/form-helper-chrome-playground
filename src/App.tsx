import React from 'react';
import { ConfigProvider, Space, Divider } from 'antd';
import FormHelper from './FormHelper';

const App: React.FC = () => (
  <ConfigProvider
    theme={{
      components: {
        Button: {
          colorPrimary: '#00b96b',
          algorithm: true,
        },
        Input: {
          colorPrimary: '#eb2f96',
          algorithm: true,
        }
      },
    }}
  >
    <Space direction="vertical" style={{ width: '100%', padding: '20px' }}>
      <h1>Form Helper with Gemini Nano</h1>
      <Divider />
      <FormHelper />
    </Space>
  </ConfigProvider>
);

export default App;
