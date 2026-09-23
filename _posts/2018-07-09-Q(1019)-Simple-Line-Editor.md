---
title: "Q(1019): Simple Line Editor"
date: 2018-07-09 22:26:20
description: "Early computer used line editor, which allowed text to be created and changed only within one line at a time. …"
tags: [CSU]
category: "18暑假集训"
---

# Q(1019): Simple Line Editor



### Q\( [1019](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=1019) \): Simple Line Editor

### Description

Early computer used line editor, which allowed text to be created and changed only within one line at a time\. However, in line editor programs, typing, editing, and document display do not occur simultaneously \(unlike the modern text editor like Microsoft Word\)\. Typically, typing does not enter text directly into the document\. Instead, users modify the document text by entering simple commands on a text\-only terminal\.

Here is an example of a simple line editor which can only process English\. In addition, it has two commands\. ‘@’ and ‘\#’\. ‘\#’ means to cancel the previous letter, and ‘@’ is a command which invalidates all the letters typed before\. That is to say, if you want type “aa”, but have mistakenly entered “ab”, then you should enter ‘\#a’ or ‘@aa&rsquo; to correct it\. Note that if there is no letter in the current document, ‘@’ or ‘\#’ command will do nothing\.


### Input

The first line contains an integer T, which is the number of test cases\. Each test case is a typing sequence of a line editor, which contains only lower case letters, ‘@’ and ‘\#’\.

there are no more than 1000 letters for each test case\.


### Output

For each test case, print one line which represents the final document of the user\. There would be no empty line in the test data\.


### Sample Input

```
2ab#aab@aa
```


### Sample Output

```
aaaa
```


题目意思很简单，就是一个简单的行编辑器，如果输入的是“\#”就取消前一次操作，如果是“@”就将整行清空。由于对vector不了解，所以我的第一想法是用的stack，看了下别人的才发现用vector方便多了。先贴用stack的代码。

```cpp
#include<iostream>
#include<stack>
#include<string>
using namespace std;
stack<char> st;
char a[1100];
int main()
{
	int t;
	string str;
	cin >> t;
	getchar();
	while (t--)
	{
		getline(cin, str);
		for (int i = 0; i < str.size(); i++)
		{
			if (str[i] == '@')
			{
				while (!st.empty())
				{
					st.pop();
				}
			}
			else if (str[i] == '#')
			{
				if (!st.empty())
				{
					st.pop();
				}
			}
			else
			{
				st.push(str[i]);
			}
		}
		int i = 0;
		for (i = 0; !st.empty(); i++)
		{
			a[i] = st.top();
			st.pop();
		}
		while (i--)
		{
			printf("%c",a[i]);
		}
		printf("\n");
	}
	return 0;
}
```

下面是用vector的。```cpp
#include<iostream>
#include<vector>
#include<string>
using namespace std;
vector<char> ve;
int main()
{
	int t;
	string str;
	cin >> t;
	getchar();
	while (t--)
	{
		ve.clear();
		getline(cin, str);
		for (int i = 0; i < str.size(); i++)
		{
			if (str[i] == '@')
			{
				if (!ve.empty())
				{
					ve.clear();
				}
			}
			else if (str[i] == '#')
			{
				if (!ve.empty())
				{
					ve.pop_back();
				}
			}
			else
			{
				ve.push_back(str[i]);
			}
		}
		for (auto it = ve.begin(); it != ve.end(); it++)
		{
			cout << *it;
		}
		/*for (int i = 0; i < ve.size(); i++)
		{
			cout << ve[i];
		}*/
		//两种都可以
		printf("\n");
	}
	return 0;
}
```