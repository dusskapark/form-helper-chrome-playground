import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Skeleton,
    Drawer,
    Empty,
    Select,
    Radio,
} from "antd";
import { ChromeOutlined } from "@ant-design/icons";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formGuide } from "./formGuide";

const { TextArea } = Input;

const { Option } = Select;

const FormHelper: React.FC = () => {
    const [form] = Form.useForm();
    const [session, setSession] = useState<any>(null);
    const [helpMessage, setHelpMessage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

    useEffect(() => {
        initializeSession();
    }, []);

    const initializeSession = async () => {
        if (window.ai && window.ai.languageModel) {
            const newSession = await window.ai.languageModel.create();
            setSession(newSession);
        } else {
            console.error("Gemini Nano is not supported in this browser");
        }
    };

    const generateAIResponse = async (errors: any[]) => {
        if (!session) {
            console.error("Session not initialized");
            return;
        }

        setIsGenerating(true);
        setHelpMessage("");

        try {
            const prompt = `
  Form Guide:
  ${formGuide}

  Current form errors:
  ${errors.map(error => `
    Field: \`${error.name.join('.')}\`
    Value: \`${form.getFieldValue(error.name)}\`
    Error: \`${error.errors.join(', ')}\`
  `).join('\n')}

    Please provide a response in the following format for each error:

    ## [Field Name]
    
    ### Problem
    [Briefly explain the cause of the error for {current value}]

    ### Solution
    [Provide step-by-step guidance on how to correct the error]
    
    ### Recommended Input
    [Rewrite the  {current value} into a valid input]

    Repeat this structure for each error field.
  `;

            const stream = await session.promptStreaming(prompt);

            for await (const chunk of stream) {
                setHelpMessage(prev => {
                    const newMessage = chunk;
                    return DOMPurify.sanitize(marked.parse(newMessage) as string);
                });
            }
        } catch (error) {
            console.error("Failed to generate response");
        } finally {
            setIsGenerating(false);
        }
    };

    const onFieldsChange = async (changedFields: any, allFields: any) => {
        const errors = allFields.filter((field: any) => 
            field.errors.length > 0 && field.touched && field.value !== undefined
        );
        if (errors.length > 0) {
            await generateAIResponse(errors);
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
            description: "A".repeat(201), // Exceeding the 200 character limit
        });
        form.validateFields();
    };

    const clearForm = () => {
        form.resetFields();
        setHelpMessage('');
    };

    return (
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
                                        // Here you would typically check against a database for uniqueness
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
                            rules={[{ required: true, message: "Please select your gender" }]}
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
                            <Button type="primary" htmlType="submit" loading={isGenerating}>
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
                <Card
                    title={
                        <span>
                            <ChromeOutlined style={{ marginRight: "8px" }} />
                            Chrome Built-in AI Response
                        </span>
                    }
                    style={{ height: "100%" }}
                    loading={isGenerating && !helpMessage}
                >
                    {helpMessage ? (
                        <div dangerouslySetInnerHTML={{ __html: helpMessage }} />
                    ) : isGenerating ? (
                        <Skeleton active paragraph={{ rows: 4 }} />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No help message generated yet"
                        />
                    )}
                </Card>
            </Col>
            <Drawer
                title="Form Helper Guide"
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                visible={isDrawerVisible}
            >
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked.parse(formGuide) as string),
                    }}
                />
            </Drawer>
        </Row>
    );
};

export default FormHelper;