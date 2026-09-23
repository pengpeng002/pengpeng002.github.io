---
title: "E - Text Editor Gym - 101466E"
date: 2019-08-15 20:43:35
description: "One of the most useful tools nowadays are text editors, their use is so important that the Unique Natural Advanced Language (UNAL) organizat…"
tags: [竞赛, 二分, 字符串, 模板]
category: "竞赛题解"
---

# E - Text Editor Gym - 101466E

One of the most useful tools nowadays are text editors, their use is so important that the Unique Natural Advanced Language \(UNAL\) organization has studied many of the benefits working with them\.

They are interested specifically in the feature "find", that option looks when a pattern occurs in a text, furthermore, it counts the number of times the pattern occurs in a text\. The tool is so well designed that while writing each character of the pattern it updates the number of times that the corresponding prefix of the total pattern appears on the text\.

Now the UNAL is working with the editor, finding patterns in some texts, however, they realize that many of the patterns appear just very few times in the corresponding texts, as they really want to see more number of appearances of the patterns in the texts, they put a lower bound on the minimum number of times the pattern should be found in the text and use only prefixes of the original pattern\. On the other hand, the UNAL is very picky about language, so they will just use the largest non\-empty prefix of the original pattern that fit into the bound\.

Input

The first line contains the text *A* \(1 ≤ | *A* | ≤  105\) The second line contains the original pattern *B* \(1 ≤ | *B* | ≤  | *A* |\) The third line contains an integer *n* \(1 ≤ *n* ≤  | *A* |\) \- the minimum number of times a pattern should be found on the text\.

Output

A single line, with the prefix of the original pattern used by the UNAL, if there is no such prefix then print "IMPOSSIBLE" \(without the quotes\)

Examples

Input

```
aaaaa
aaa
4
```

Output

```
aa
```

Input

```
programming
unal
1
```

Output

```
IMPOSSIBLE
```

Input

```
abracadabra
abra
1
```

Output

```
abra
```

Input

```
Hello World!
H W
5
```

Output

```
IMPOSSIBLE
```

题意：在子串中找一个最长前缀子串，要求在母串中出现的次数大于或等于n。

方法：二分长度，KMP找匹配次数。只要把KMP算法的模板改一下就好。（虽然全都是自己手敲的，但第42行我也不知道用处何在，还望有大佬能指点迷津）

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int nex[maxn] = {-1};
char s1[maxn], s2[maxn];
void get_next(int len)//初始化nex数组 
{
	int i = 0, j = -1;
	while(i < len)
		if(j == -1 || s2[i] == s2[j]) i++, j++, nex[i] = j;
		else j = nex[j];
}
int count(int len1, int len2)//记录出现了多少次 //KMP算法模板 
{
	int i = 0, j = 0, ans = 0;
	while (i < len1)
	{
		while (!(j == -1 || s1[i] == s2[j])) j = nex[j]; 
		i++, j++;
		if (j == len2) j = nex[j], ans++;//此时已经找到一个匹配了 
	}
	return ans;
}
int main()
{
	int n;
	gets(s1);
	gets(s2);
	scanf("%d", &n);
	int len1 = strlen(s1), len2 = strlen(s2);//母串和子串的长度 
	int l = 0, r = len2, ans;
	get_next(len2);
	if (count(len1, len2) >= n)//不能省，二分是分不到最后那个点的 
	{
		puts(s2);
		return 0;
	}
	while (l < r)//对子串的前缀长度二分 
	{
		int mid = (l + r) >> 1;//等价于 mid = (l + r) / 2; 
		char ch = s2[mid]; 
		s2[mid] = '\0';//可以保证count对s2的访问不会到mid+1 //感觉完全没用，但不要就会RE，在第24组 
		if (count(len1, mid) >= n) l = mid + 1, ans = mid;//如果当前长度满足要求，就找右边，即找更长的前缀 
		else r = mid;//不满足就找左边 
		s2[mid] = ch;//因为以后可能会找到更长的前缀串，所以不能把子串改了 
	}
	if(ans == 0) puts("IMPOSSIBLE");//找不到满足条件的串 
	s2[ans]='\0';//要截取一个前缀子串最省时的方法就是把最后一个字符的下一个赋为'\0' 
	puts(s2);//因为puts遇到'\0'就会停止 
}
```