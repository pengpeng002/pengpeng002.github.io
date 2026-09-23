---
title: "1170: A Simple Problem"
date: 2018-07-12 22:38:58
description: "在一个由N个整数组成的数列中，最多能找到多少个位置连续的整数且其中的最大值与最小值之差不超过K呢？"
tags: [CSU, 动态规划]
category: "18暑假集训"
---

# 1170: A Simple Problem

##  [1170: A Simple Problem](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=1170) 

[](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1170) [](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1170) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1170) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1170) Time Limit:1 SecMemory Limit:128 MbSubmitted:1305Solved:187---

### Description

在一个由N个整数组成的数列中，最多能找到多少个位置连续的整数且其中的最大值与最小值之差不超过K呢？


### Input

输入包含若干组数据。每组数据的第一行有2个正整数，N\(1<=N<=10^6\),K\(0<=K<=10^6\)，其中N、K的含义同上，接下来一行一共有N个32位有符号整数\(32\-bit signed integer\)，依次描绘了这个数列中各个整数的值。


### Output

对于每组数据，输出一个正整数，表示在这个数列中最多能找到多少个位置连续的整数且其中的最大值与最小值之差不超过K。


### Sample Input

```
4 2
3 1 5 2

3 2
3 1 2
```


### Sample Output

```
2
3
```



其实题目意思就是求最长子序列，只不过多加了个限制条件而已。解释都在注释里，就自己看注释好了，有问题的欢迎留言

```cpp
#include<iostream>
#include<set>
const int maxn = 1e6 +5;
long long int a[maxn];
using namespace std;
int main()
{
	multiset<long long int> se;
	int n, k;
	while (scanf ("%d%d", &n, &k) == 2)
	{
		for (int i = 0; i < n; i++)
		{
			scanf ("%lld", &a[i]);
		}
		se.insert(a[0]);
		int l = 0, r = 0;//将数组从左到右过一遍，l为序列左边的值，r为右边。r-l+1就是序列长
		//如果有不理解的就自己画个图吧，看r和l是怎么走的。将r和l当成指针可能会容易理解些
		//l和r初始位置都是在数组的0号位置。
		int len = 0;
		while (r != n)//知道r走到了数组的最后一个位置截止
		{
			if (*(--se.end()) - *(se.begin()) <= k)//保证最大值最小值的差不超过k
			{
				if (r - l + 1 >len)
				{
					len = r - l + 1;
				}
				r++;//r往右走，序列长增加
				se.insert(a[r]);
			}
			else//超过了k，所以将l往右走，并且将l原本对应的值删掉
			{
				auto it = se.find(a[l]);
				se.erase(it);
				l++;
			}
		}
		cout << len << endl;
		se.clear();
	}
	return 0;
}
```