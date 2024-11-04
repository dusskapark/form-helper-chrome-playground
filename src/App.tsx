import React, { useState } from "react";
import {
  ConfigProvider,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Drawer,
  Select,
  Radio,
  Space,
  Divider,
  Switch,
  theme,
} from "antd";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { formGuide } from "./formGuide";
import { FormHelperChrome, createPrompt } from "form-helper-chrome";

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

const { TextArea } = Input;
const { Option } = Select;

interface FormError {
  name: string[];
  errors: string[];
  value: any;
  touched: boolean;
}

const App: React.FC = () => {
  const [form] = Form.useForm();
  const [currentError, setCurrentError] = useState<FormError | undefined>(
    undefined
  );
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const onFieldsChange = (changedFields: any) => {
    const changedField = changedFields[0];
    if (
      changedField &&
      changedField.errors.length > 0 &&
      changedField.touched &&
      changedField.value !== undefined
    ) {
      setCurrentError(changedField);
    } else {
      setCurrentError(undefined);
    }
  };

  const fillSampleData = () => {
    form.setFieldsValue({
      username: "Invalid Username!",
      email: "invalid-email",
      password: "short",
      confirmPassword: "not-matching",
      gender: "invalid",
      country: "non-existent-country",
      description: "A".repeat(201),
    });
    form.validateFields();
  };

  const clearForm = () => {
    form.resetFields();
    setCurrentError(undefined);
  };

  const prompt = currentError
    ? createPrompt(currentError, DOMPurify.sanitize(marked.parse(formGuide) as string))
    : "";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? [darkAlgorithm, compactAlgorithm]
          : [defaultAlgorithm, compactAlgorithm],
        components: {
          Button: {
            colorPrimary: "#00b96b",
            algorithm: true,
          },
          Input: {
            colorPrimary: "#eb2f96",
            algorithm: true,
          },
        },
      }}
    >
      <Space direction="vertical" style={{ width: "100%", padding: "20px" }}>
        <Row justify="space-between" align="middle">
          <h1>Form Helper with Gemini Nano</h1>
          <Switch
            checkedChildren="Dark"
            unCheckedChildren="Light"
            checked={isDarkMode}
            onChange={(checked) => setIsDarkMode(checked)}
          />
        </Row>{" "}
        <Divider />
        <Row gutter={16}>
          <Col span={16}>
            <Card
              title="Sign Up Form"
              extra={
                <Button type="link" onClick={() => setIsDrawerVisible(true)}>
                  Guide
                </Button>
              }
            >
              <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFieldsChange={onFieldsChange}
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    { required: true, message: "Please input your username" },
                    {
                      pattern: /^[a-zA-Z0-9-_.&,/()]{1,255}$/,
                      message:
                        "Username can only contain a-zA-Z0-9-_.&,/(), max 255 characters",
                    },
                    {
                      validator: async (_, value) => {
                        if (value === "taken-username") {
                          throw new Error("This username is already taken");
                        }
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Please input a valid email",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please input your password" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[
                    { required: true, message: "Please select your gender" },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="other">Other</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Please enter a description" },
                    {
                      max: 200,
                      message: "Description cannot exceed 200 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter a brief description about yourself"
                    maxLength={200}
                  />
                </Form.Item>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[
                    { required: true, message: "Please select your country" },
                  ]}
                >
                  <Select placeholder="Select your country">
                    <Option value="indonesia">Indonesia</Option>
                    <Option value="japan">Japan</Option>
                    <Option value="korea">Korea</Option>
                    <Option value="malaysia">Malaysia</Option>
                    <Option value="singapore">Singapore</Option>
                    <Option value="taiwan">Taiwan</Option>
                    <Option value="thailand">Thailand</Option>
                    <Option value="vietnam">Vietnam</Option>
                  </Select>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                  <Button onClick={fillSampleData} style={{ marginLeft: 8 }}>
                    Fill Sample Data
                  </Button>
                  <Button onClick={clearForm} style={{ marginLeft: 8 }}>
                    Clear
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col span={8}>
            <FormHelperChrome
              prompt={prompt}
              fontSize="14px"
              isDarkMode={isDarkMode}
            />
          </Col>
        </Row>
        <Drawer
          title="Form Helper Guide"
          placement="right"
          onClose={() => setIsDrawerVisible(false)}
          open={isDrawerVisible}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked.parse(formGuide) as string),
            }}
          />
        </Drawer>
      </Space>
    </ConfigProvider>
  );
};

export default App;