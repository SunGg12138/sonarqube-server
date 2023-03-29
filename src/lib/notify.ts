import axios from 'axios';
import * as config from 'config';
import * as sonarqube from './sonarqube';
import { MsgType, CodeQualityOptions, CodeQualityFailOptions } from '../@types/notify';

const sonarqubeWebUrl = config.get('sonarqube.web_url');

// 参数错误通知
export function paramsError (webhook_url: string, options: { text: string }) {
    return send(webhook_url, {
        msg_type: 'text',
        content: {
            text: options.text,
        },
    });
}

// 发送代码质量通知
export async function codeQuality (success_webhook_url: string, fail_webhook_url: string, options: CodeQualityOptions) {
    const { measures } = await sonarqube.searchMeasures({
        projectKeys: [ options.projectKey ],
        metricKeys: [
            'alert_status',
            'new_bugs',
            'new_vulnerabilities',
            'new_security_hotspots',
            'new_code_smells',
        ],
    });
    const alertStatus = measures.find(item => item.metric === 'alert_status');

    console.log('[Code Quality] 项目代码质量结果:');
    console.log(alertStatus);

    // 通知消息
    if (alertStatus.value === 'OK') {
        await codeQualitySuccess(success_webhook_url, options);
    } else {
        await codeQualityFail(fail_webhook_url, { ...options, measures });
    }
}

// 代码检测没有发现问题通知
export function codeQualitySuccess (webhook_url: string, options: CodeQualityOptions) {
    return send(webhook_url, {
        "templateId": "ctp_AAu5TuKcZK6t",
        "msg_type": 'interactive',
        "card": {
            "config": {
                "wide_screen_mode": true
            },
            "header": {
                "template": "green",
                "title": {
                    "tag": "plain_text",
                    "content": "✅ 代码质量检测成功"
                }
            },
            "elements": [
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**项目名称：**\n${options.packageName}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**commit id：**\n${options.commitSha.slice(-7)}`
                            }
                        }
                    ]
                },
                {
                    "tag": "hr"
                },
                {
                    "tag": "markdown",
                    "content": `**提交人**: ${options.actor}`,
                    "text_align": "left"
                },
            ]
        },
        "mock_data": "{}",
        "variables": []
    });
}

// 代码检测发现问题通知
export function codeQualityFail (webhook_url: string, options: CodeQualityFailOptions) {
    const { measures } = options;

    const newBugs = measures.find(item => item.metric === 'new_bugs');
    const newVulnerabilities = measures.find(item => item.metric === 'new_vulnerabilities');
    const newSecurityHotspots = measures.find(item => item.metric === 'new_security_hotspots');
    const newCodeSmells = measures.find(item => item.metric === 'new_code_smells');
    const newBugsStatus = newBugs.period.value;
    const newVulnerabilitiesStatus = newVulnerabilities.period.value;
    const newSecurityHotspotsStatus = newSecurityHotspots.period.value;
    const newCodeSmellsStatus = newCodeSmells.period.value;

    return send(webhook_url, {
        "templateId": "ctp_AAu5TuKcZOd7",
        "msg_type": 'interactive',
        "card": {
            "config": {
                "wide_screen_mode": true
            },
            "header": {
                "template": "red",
                "title": {
                    "tag": "plain_text",
                    "content": "⚠️ 代码质量检测失败"
                }
            },
            "elements": [
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**项目名称：**\n${options.packageName}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**commit id：**\n${options.commitSha.slice(-7)}`
                            }
                        }
                    ]
                },
                {
                    "tag": "hr"
                },
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `<font color=\"${newBugsStatus > 0? 'red' : 'green'}\">**新增BUG：**\n${newBugsStatus}\n</font>`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `<font color=\"${newVulnerabilitiesStatus > 0? 'red' : 'green'}\">**新增漏洞：**\n${newVulnerabilitiesStatus}\n</font>`
                            }
                        }
                    ]
                },
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `<font color=\"${newSecurityHotspotsStatus > 0? 'red' : 'green'}\">**新增安全问题：**\n${newSecurityHotspotsStatus}\n</font>`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `<font color=\"${newCodeSmellsStatus > 0? 'red' : 'green'}\">**新增坏代码：**\n${newCodeSmellsStatus}\n</font>`
                            }
                        }
                    ]
                },
                {
                    "tag": "hr"
                },
                {
                    "tag": "markdown",
                    "content": `**提交人**: ${options.actor}`,
                    "text_align": "left"
                },
                {
                    "tag": "markdown",
                    "content": `[查看详情](${sonarqubeWebUrl}/dashboard?id=${options.projectKey})`
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "img",
                            "img_key": "img_v2_041b28e3-5680-48c2-9af2-497ace79333g",
                            "alt": {
                                "tag": "plain_text",
                                "content": ""
                            }
                        },
                        {
                            "tag": "plain_text",
                            "content": "请按详情及时修改问题"
                        }
                    ]
                }
            ]
        },
        "mock_data": "{}",
        "variables": []
    });
}

// 发送消息
async function send (
    webhook_url: string,
    options: {
        msg_type: MsgType;
        content?: Record<string, any>;
        card?: Record<string, any>;
        templateId?: string;
        mock_data?: string;
        variables?: any[];
    }
) {
    return axios({
        url: webhook_url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: options,
    }).then(function (res) {
        if (res.status !== 200 || res.data.code !== 0) {
            console.log('[Post webhook Error]:');
            console.log('status:', res.status);
            console.log('data:',res.data);
        }
        return res;
    });
}
